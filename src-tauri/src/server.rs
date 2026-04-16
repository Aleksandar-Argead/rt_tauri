use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tauri::{AppHandle, Emitter};
use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use uuid::Uuid;

pub async fn start_websocket_server(app: AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("0.0.0.0:9090").await?;
    println!("🚀 Reactotron clone WS server listening on ws://0.0.0.0:9090");

    while let Ok((stream, addr)) = listener.accept().await {
        let app_clone = app.clone();

        tokio::spawn(async move {
            match accept_async(stream).await {
                Ok(ws_stream) => {
                    let (mut write, mut read) = ws_stream.split();
                    let conn_id = Uuid::new_v4().to_string();

                    // Send greeting (adjust based on what reactotron-core-client expects)
                    let greeting = json!({ "type": "hello.server", "payload": {} });
                    let _ = write.send(Message::text(greeting.to_string())).await;
                    // Notify frontend of new connection
                    let _ = app_clone.emit("client-connected", (&conn_id, addr.to_string()));

                    // Handle incoming messages
                    while let Some(Ok(msg)) = read.next().await {
                        if let tokio_tungstenite::tungstenite::Message::Text(text) = msg {
                            if let Ok(cmd) = serde_json::from_str::<serde_json::Value>(&text) {
                                // For MVP, forward the raw command + conn_id
                                let event_payload = json!({
                                    "command": cmd,
                                    "connectionId": conn_id
                                });
                                let _ = app_clone.emit("new-command", event_payload);
                                println!("📥 Received from {}: {}", addr, cmd["type"]);
                            }
                        }
                    }

                    // On disconnect
                    let _ = app_clone.emit("client-disconnected", conn_id);
                }
                Err(e) => eprintln!("WS accept error: {}", e),
            }
        });
    }

    Ok(())
}
