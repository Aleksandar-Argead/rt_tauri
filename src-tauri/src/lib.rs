mod server;

use std::sync::Arc;

use tokio::sync::RwLock;

use server::start_websocket_server;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Default)]
struct AppState {
    // For MVP: you can store connections here if needed
    connections: std::collections::HashMap<String, ()>, // conn_id -> dummy
                                                        // Later: timeline: Vec<Command>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(RwLock::new(AppState::default()))) // share state
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Start the WS server in background
            tokio::spawn(async move {
                if let Err(e) = start_websocket_server(app_handle).await {
                    eprintln!("WebSocket server error: {}", e);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
