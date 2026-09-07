extends Control
class_name MenuWindow

## 絵巻物手鑑メニュー (MenuWindow)
## 強さ、どうぐ、章の移動、記録、とじる

signal status_requested
signal item_requested
signal chapter_move_requested(chapter_num: int)
signal save_requested
signal closed

var selected_index: int = 0
var items: Array[String] = ["強さ（能力）", "どうぐ", "章の移動", "記録（セーブ）", "とじる"]

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
	selected_index = 0
	visible = true
	refresh_display()

func refresh_display() -> void:
	for c in list_container.get_children():
		c.queue_free()
		
	for i in range(items.size()):
		var lbl := Label.new()
		var prefix := "▶ " if i == selected_index else "   "
		lbl.text = prefix + items[i]
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
		
	money_label.text = "所持金: %d 両" % GameState.money

func handle_custom_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_echo():
		return
		
	if event.is_action_pressed("ui_up"):
		selected_index = (selected_index - 1 + items.size()) % items.size()
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("ui_down"):
		selected_index = (selected_index + 1) % items.size()
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("confirm") or event.is_action_pressed("ui_accept"):
		execute_selected_item()
	elif event.is_action_pressed("cancel"):
		AudioManager.play_se("se_cancel")
		close()

func execute_selected_item() -> void:
	AudioManager.play_se("se_select")
	match selected_index:
		0:
			status_requested.emit()
		1:
			item_requested.emit()
		2:
			handle_chapter_move()
		3:
			save_requested.emit()
		4:
			close()

func handle_chapter_move() -> void:
	# 次の章または前の章へ切り替え
	var next_ch := (GameState.current_chapter % 3) + 1
	if MasterData.is_chapter_unlocked(next_ch, GameState.boss_defeated, GameState.artifacts):
		chapter_move_requested.emit(next_ch)
		close()
	else:
		AudioManager.play_se("se_cancel")

func close() -> void:
	visible = false
	closed.emit()
