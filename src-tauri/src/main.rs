// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let builder = tauri::Builder::default().setup(|_app| {
        #[cfg(debug_assertions)] // only include this code on debug builds
        {
            use tauri::Manager;
            let window = _app.get_webview_window("main").unwrap();
            window.open_devtools();
            // window.close_devtools();
        }
        Ok(())
    });

    builder
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
