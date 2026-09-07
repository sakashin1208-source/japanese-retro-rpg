extends Control
class_name DialogBox

## 会話ダイアログUI (DialogBox)
## 漆枠・顔ポートレート・タイプライター文字送り

signal dialog_finished

var speaker_name: String = ""
var messages: Array[String] = []
var portrait_key: String = ""

var current_page: int = 0
var current_text: String = ""
var char_index: int = 0
var is_page_complete: bool = false
var text_timer: float = 0.0
const CHAR_DELAY: float = 0.035

var frame_ctrl: UrushiFrame
var portrait_texture_rect: TextureRect
var text_label: Label
var prompt_label: Label

func _ready() -> void:
	custom_minimum_size = Vector2(1208, 338)
	size = Vector2(1208, 338)
	position = Vector2(36, 590)
	
	frame_ctrl = UrushiFrame.new()
	frame_ctrl.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(frame_ctrl)
	
	portrait_texture_rect = TextureRect.new()
	portrait_texture_rect.position = Vector2(32, 52)
	portrait_texture_rect.size = Vector2(192, 192)
	portrait_texture_rect.custom_minimum_size = Vector2(192, 192)
	portrait_texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	add_child(portrait_texture_rect)
	
	text_label = Label.new()
	text_label.position = Vector2(256, 64)
	text_label.size = Vector2(910, 220)
	text_label.add_theme_font_size_override("font_size", 38)
	text_label.add_theme_color_override("font_color", Color(0.98, 0.98, 0.95))
	text_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	text_label.add_theme_constant_override("shadow_offset_x", 2)
	text_label.add_theme_constant_override("shadow_offset_y", 2)
	text_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(text_label)
	
	prompt_label = Label.new()
	prompt_label.position = Vector2(1208 - 280, 338 - 50)
	prompt_label.size = Vector2(240, 40)
	prompt_label.text = "▼ [決定 / タップ]"
	prompt_label.add_theme_font_size_override("font_size", 24)
	prompt_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	prompt_label.visible = false
	add_child(prompt_label)
	
	mouse_filter = Control.MOUSE_FILTER_STOP
	gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
			advance()
			accept_event()
	)

func start_dialog(p_speaker: String, p_messages: Array[String], p_portrait_key: String = "") -> void:
	speaker_name = p_speaker
	messages = p_messages
	portrait_key = p_portrait_key
	
	frame_ctrl.title = speaker_name
	current_page = 0
	visible = true
	
	# ポートレート画像のセット
	if portrait_key != "":
		var p_name := portrait_key
		var aliases := {
			"npc_smith_genzo": "npc_smith",
			"npc_taichi": "npc_boy",
			"npc_merchant_jinbei": "npc_merchant",
			"npc_yone": "npc_grandma",
			"npc_suzu": "npc_miko_apprentice",
			"npc_yugen": "npc_biwa_monk",
			"npc_village_head": "npc_elder",
			"npc_priest": "npc_kannushi",
			"npc_shadow_scout": "npc_kagemaru",
			"npc_chobei": "captain",
			"npc_oshino": "inn_keeper",
			"npc_kansuke": "fisherman",
			"npc_guardsman": "guard_captain"
		}
		if aliases.has(p_name):
			p_name = aliases[p_name]
			
		var p_path := "res://assets/portraits/%s.png" % p_name
		if not ResourceLoader.exists(p_path) and p_name.begins_with("npc_"):
			var stripped := p_name.trim_prefix("npc_")
			if ResourceLoader.exists("res://assets/portraits/%s.png" % stripped):
				p_path = "res://assets/portraits/%s.png" % stripped
				
		if ResourceLoader.exists(p_path):
			portrait_texture_rect.texture = load(p_path)
			portrait_texture_rect.visible = true
			text_label.position.x = 256
			text_label.size.x = 910
		else:
			portrait_texture_rect.visible = false
			text_label.position.x = 64
			text_label.size.x = 1080
	else:
		portrait_texture_rect.visible = false
		text_label.position.x = 64
		text_label.size.x = 1080
		
	show_page(0)

func show_page(page_idx: int) -> void:
	current_page = page_idx
	if current_page >= messages.size():
		close_dialog()
		return
		
	current_text = messages[current_page]
	char_index = 0
	is_page_complete = false
	text_timer = 0.0
	text_label.text = ""
	prompt_label.visible = false

func _process(delta: float) -> void:
	if not visible or is_page_complete:
		return
		
	text_timer += delta
	if text_timer >= CHAR_DELAY:
		text_timer = 0.0
		char_index += 1
		text_label.text = current_text.substr(0, char_index)
		if char_index % 3 == 0:
			AudioManager.play_se("se_cursor")
			
		if char_index >= current_text.length():
			is_page_complete = true
			prompt_label.visible = true

func advance() -> void:
	if not is_page_complete:
		char_index = current_text.length()
		text_label.text = current_text
		is_page_complete = true
		prompt_label.visible = true
	else:
		AudioManager.play_se("se_select")
		show_page(current_page + 1)

func close_dialog() -> void:
	visible = false
	dialog_finished.emit()

func handle_custom_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_echo():
		return
		
	if event.is_action_pressed("confirm") or event.is_action_pressed("ui_accept"):
		advance()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		advance()
		get_viewport().set_input_as_handled()
	elif event is InputEventKey and event.pressed and (event.keycode == KEY_SPACE or event.keycode == KEY_ENTER or event.keycode == KEY_Z):
		advance()
		get_viewport().set_input_as_handled()
