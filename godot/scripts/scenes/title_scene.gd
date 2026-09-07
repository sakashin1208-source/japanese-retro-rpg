extends Node2D

## タイトルシーン (TitleScene)

var selected_index: int = 0
var has_save: bool = false
var menu_items: Array[Dictionary] = []

@onready var title_label: Label = $TitleLabel
@onready var sub_title_label: Label = $SubTitleLabel
@onready var menu_container: VBoxContainer = $MenuContainer
@onready var save_info_label: Label = $SaveInfoLabel

func _ready() -> void:
	AudioManager.play_bgm("bgm_title")
	has_save = SaveManager.has_save_data()
	
	menu_items = [
		{"label": "は じ め か ら", "enabled": true},
		{"label": "つ づ き か ら" if has_save else "つ づ き か ら (無)", "enabled": has_save},
		{"label": "序 幕（オープニング）", "enabled": true},
		{"label": "終 幕（エンディング）", "enabled": true}
	]
	selected_index = 1 if has_save else 0
	
	if has_save:
		save_info_label.text = "【記録】 " + SaveManager.get_save_summary()
	else:
		save_info_label.text = ""
		
	refresh_menu()

func refresh_menu() -> void:
	for c in menu_container.get_children():
		c.queue_free()
		
	for i in range(menu_items.size()):
		var it: Dictionary = menu_items[i]
		var btn := Button.new()
		var prefix := "▶ " if i == selected_index else "   "
		btn.text = prefix + it["label"]
		btn.add_theme_font_size_override("font_size", 34)
		btn.flat = true
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		
		if it["enabled"]:
			btn.add_theme_color_override("font_color", Color(1, 0.85, 0.3) if i == selected_index else Color(0.95, 0.95, 0.95))
			var idx := i
			btn.pressed.connect(func():
				selected_index = idx
				execute_selected()
			)
			btn.mouse_entered.connect(func():
				if selected_index != idx:
					selected_index = idx
					AudioManager.play_se("se_cursor")
					refresh_menu()
			)
		else:
			btn.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))
			btn.disabled = true
			
		menu_container.add_child(btn)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_up"):
		select_prev()
	elif event.is_action_pressed("ui_down"):
		select_next()
	elif event.is_action_pressed("confirm"):
		execute_selected()

func select_prev() -> void:
	var count := menu_items.size()
	for i in range(count):
		selected_index = (selected_index - 1 + count) % count
		if menu_items[selected_index]["enabled"]:
			AudioManager.play_se("se_cursor")
			refresh_menu()
			return

func select_next() -> void:
	var count := menu_items.size()
	for i in range(count):
		selected_index = (selected_index + 1) % count
		if menu_items[selected_index]["enabled"]:
			AudioManager.play_se("se_cursor")
			refresh_menu()
			return

func execute_selected() -> void:
	if not menu_items[selected_index]["enabled"]:
		AudioManager.play_se("se_cancel")
		return
		
	AudioManager.play_se("se_select")
	match selected_index:
		0:
			# はじめから
			GameState.reset()
			SceneManager.change_scene("MAP", {"chapter_num": 1}, 0.5)
		1:
			# つづきから
			if SaveManager.load_game():
				SceneManager.change_scene("MAP", {"chapter_num": GameState.current_chapter}, 0.5)
			else:
				AudioManager.play_se("se_cancel")
		2:
			# 序幕
			SceneManager.change_scene("OPENING", {}, 0.4)
		3:
			# 終幕
			SceneManager.change_scene("ENDING", {}, 0.4)
