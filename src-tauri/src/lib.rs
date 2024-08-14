#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::menu::Menu;

pub fn run() {
    let builder = tauri::Builder::default().setup(|_app| {
        // #[cfg(debug_assertions)] // only include this code on debug builds
        // {
        use tauri::Manager;
        let window = _app.get_webview_window("rhea_window_main").unwrap();
        window.open_devtools();
        // window.close_devtools();
        // }
        Ok(())
    });

    builder
        .menu(|_app| Menu::new(_app))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
