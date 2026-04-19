mod server;

use std::sync::Arc;

use tauri::async_runtime;
use tokio::sync::RwLock;

use server::start_websocket_server;

#[derive(Default)]
struct AppState {
    // For MVP: you can store connections here if needed
    // connections: std::collections::HashMap<String, ()>, // conn_id -> dummy
    // Later: timeline: Vec<Command>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(RwLock::new(AppState::default()))) // share state
        .setup(|app| {
            let app_handle = app.handle().clone();

            async_runtime::spawn(async move {
                if let Err(e) = start_websocket_server(app_handle).await {
                    eprintln!("WebSocket server error: {}", e);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
