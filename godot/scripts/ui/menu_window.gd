extends Control
class_name MenuWindow

## 絵巻物手鑑メニュー (MenuWindow)
## 強さ、どうぐ、章の移動、記録、とじる

signal status_requested
signal item_requested
signal chapter_move_requested(chapter_num: int)
signal chapter_move_denied(reason: String)
signal save_requested
signal closed

var is_chapter_select: bool = false
var selected_index: int = 0
var main_items: Array[String] = ["強さ（能力）", "どうぐ", "章の移動", "記録（セーブ）", "とじる"]
var chapter_items: Array[Dictionary] = []

var frame_ctrl: UrushiFrame
var list_container: VBoxContainer
var money_label: Label

func _ready() -> void:
	custom_minimum_size = Vector2(460, 480)
	size = Vector2(460, 480)
	position = Vector2(740, 120)
	
	frame_ctrl = UrushiFrame.new()
	frame_ctrl.title = "絵巻物手鑑"
	frame_ctrl.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(frame_ctrl)
	
	list_container = VBoxContainer.new()
	list_container.position = Vector2(40, 70)
	list_container.size = Vector2(380, 320)
	list_container.add_theme_constant_override("separation", 16)
	add_child(list_container)
	
	money_label = Label.new()
	money_label.position = Vector2(40, 410)
	money_label.size = Vector2(380, 40)
	money_label.add_theme_font_size_override("font_size", 24)
	money_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	add_child(money_label)

func open() -> void:
	is_chapter_select = false
	selected_index = 0
	visible = true
	frame_ctrl.title = "絵巻物手鑑"
	refresh_display()

func refresh_display() -> void:
	for c in list_container.get_children():
		c.queue_free()
		
	if not is_chapter_select:
		refresh_main_menu()
	else:
		refresh_chapter_menu()

func refresh_main_menu() -> void:
	frame_ctrl.title = "絵巻物手鑑"
	for i in range(main_items.size()):
		var lbl := Label.new()
		var prefix := "▶ " if i == selected_index else "   "
		lbl.text = prefix + main_items[i]
		lbl.add_theme_font_size_override("font_size", 32)
		lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.4) if i == selected_index else Color.WHITE)
		lbl.mouse_filter = Control.MOUSE_FILTER_STOP
		var item_idx := i
		lbl.gui_input.connect(func(ev: InputEvent) -> void:
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				if selected_index == item_idx:
					execute_selected_item()
				else:
					selected_index = item_idx
					AudioManager.play_se("se_cursor")
					refresh_display()
		)
		list_container.add_child(lbl)
		
	money_label.visible = true
	money_label.text = "所持金: %d 両" % GameState.money

func refresh_chapter_menu() -> void:
	frame_ctrl.title = "章の移動"
	chapter_items.clear()
	
	for ch in MasterData.chapters:
		var ch_id: int = ch.get("id", 1)
		var unlocked: bool = MasterData.is_chapter_unlocked(ch_id, GameState.boss_defeated, GameState.artifacts)
		chapter_items.append({
			"id": ch_id,
			"name": ch.get("name", "第%d章" % ch_id),
			"unlocked": unlocked,
			"is_current": (ch_id == GameState.current_chapter)
		})
	chapter_items.append({"id": -1, "name": "戻る", "unlocked": true, "is_current": false})
	
	for i in range(chapter_items.size()):
		var item: Dictionary = chapter_items[i]
		var lbl := Label.new()
		var prefix := "▶ " if i == selected_index else "   "
		var suffix := " (現在地)" if item["is_current"] else ("" if item["unlocked"] else " [未解放]")
		lbl.text = prefix + item["name"] + suffix
		lbl.add_theme_font_size_override("font_size", 24)
		
		var col: Color = Color.WHITE
		if not item["unlocked"]:
			col = Color(0.6, 0.6, 0.6)
		elif item["is_current"]:
			col = Color(0.5, 0.9, 1.0)
		if i == selected_index:
			col = Color(1, 0.9, 0.4)
		lbl.add_theme_color_override("font_color", col)
		lbl.mouse_filter = Control.MOUSE_FILTER_STOP
		var item_idx := i
		lbl.gui_input.connect(func(ev: InputEvent) -> void:
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				if selected_index == item_idx:
					execute_selected_item()
				else:
					selected_index = item_idx
					AudioManager.play_se("se_cursor")
					refresh_display()
		)
		list_container.add_child(lbl)
		
	money_label.visible = false

func handle_custom_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_echo():
		return
		
	var item_count: int = chapter_items.size() if is_chapter_select else main_items.size()
	if event.is_action_pressed("ui_up"):
		selected_index = (selected_index - 1 + item_count) % item_count
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("ui_down"):
		selected_index = (selected_index + 1) % item_count
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("confirm"):
		execute_selected_item()
	elif event.is_action_pressed("cancel"):
		AudioManager.play_se("se_cancel")
		if is_chapter_select:
			is_chapter_select = false
			selected_index = 2 # 「章の移動」の位置に戻す
			refresh_display()
		else:
			close()

func execute_selected_item() -> void:
	if not is_chapter_select:
		AudioManager.play_se("se_select")
		match selected_index:
			0:
				status_requested.emit()
			1:
				item_requested.emit()
			2:
				# 章選択サブメニューへ移行
				is_chapter_select = true
				selected_index = 0
				refresh_display()
			3:
				save_requested.emit()
			4:
				close()
	else:
		var item: Dictionary = chapter_items[selected_index]
		if item["id"] == -1:
			# 戻る
			AudioManager.play_se("se_cancel")
			is_chapter_select = false
			selected_index = 2
			refresh_display()
			return
			
		if item["is_current"]:
			AudioManager.play_se("se_cancel")
			close()
			chapter_move_denied.emit("既にこの章に滞在しています。")
			return
			
		if item["unlocked"]:
			AudioManager.play_se("se_select")
			chapter_move_requested.emit(item["id"])
			close()
		else:
			AudioManager.play_se("se_cancel")
			var reason: String = get_chapter_locked_reason(item["id"])
			close()
			chapter_move_denied.emit(reason)

func get_chapter_locked_reason(ch_id: int) -> String:
	if ch_id == 2:
		var ch1 = MasterData.get_chapter_info(1)
		var boss_name := "九尾の妖狐・茜"
		if ch1 and ch1.has("bosses") and not ch1["bosses"].is_empty():
			var b_id: String = ch1["bosses"].back().get("id", "")
			var e_data: Dictionary = MasterData.get_enemy(b_id)
			if not e_data.is_empty():
				boss_name = e_data.get("name", boss_name)
		return "第二章へ進むには、第一章の強敵『%s』を討伐する必要があります。" % boss_name
	elif ch_id == 3:
		return "第三章へ進むには、第二章の魔物を討伐し、神具を集める必要があります。"
	return "この章はまだ解放されていません。"

func close() -> void:
	is_chapter_select = false
	visible = false
	closed.emit()
