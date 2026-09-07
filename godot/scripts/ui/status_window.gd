extends Control
class_name StatusWindow

## つよさ（能力）画面 (StatusWindow)

signal closed

var party_index: int = 0
var skill_cursor: int = 0

var frame_ctrl: UrushiFrame
var portrait_rect: TextureRect
var name_label: Label
var title_label: Label
var job_label: Label
var stats_grid: GridContainer
var skills_container: VBoxContainer
var skill_desc_label: Label

func _ready() -> void:
	custom_minimum_size = Vector2(1216, 896)
	size = Vector2(1216, 896)
	position = Vector2(32, 32)
	
	frame_ctrl = UrushiFrame.new()
	frame_ctrl.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(frame_ctrl)
	
	portrait_rect = TextureRect.new()
	portrait_rect.position = Vector2(72, 148)
	portrait_rect.size = Vector2(160, 160)
	portrait_rect.custom_minimum_size = Vector2(160, 160)
	portrait_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	add_child(portrait_rect)
	
	name_label = Label.new()
	name_label.position = Vector2(260, 150)
	name_label.size = Vector2(600, 48)
	name_label.add_theme_font_size_override("font_size", 44)
	name_label.add_theme_color_override("font_color", Color(1.0, 0.94, 0.82))
	add_child(name_label)
	
	title_label = Label.new()
	title_label.position = Vector2(260, 205)
	title_label.size = Vector2(600, 36)
	title_label.add_theme_font_size_override("font_size", 28)
	title_label.add_theme_color_override("font_color", Color(0.85, 0.7, 0.25))
	add_child(title_label)
	
	job_label = Label.new()
	job_label.position = Vector2(260, 250)
	job_label.size = Vector2(600, 36)
	job_label.add_theme_font_size_override("font_size", 28)
	job_label.add_theme_color_override("font_color", Color(0.8, 0.78, 0.88))
	add_child(job_label)
	
	# パラメータグリッド
	stats_grid = GridContainer.new()
	stats_grid.position = Vector2(72, 340)
	stats_grid.size = Vector2(1072, 160)
	stats_grid.columns = 3
	stats_grid.add_theme_constant_override("h_separation", 60)
	stats_grid.add_theme_constant_override("v_separation", 16)
	add_child(stats_grid)
	
	# 技一覧
	var skill_title := Label.new()
	skill_title.position = Vector2(72, 530)
	skill_title.size = Vector2(400, 36)
	skill_title.text = "【 習 得 技 ・ 術 一 覧 】"
	skill_title.add_theme_font_size_override("font_size", 30)
	skill_title.add_theme_color_override("font_color", Color(1.0, 0.9, 0.5))
	add_child(skill_title)
	
	skills_container = VBoxContainer.new()
	skills_container.position = Vector2(72, 580)
	skills_container.size = Vector2(1072, 160)
	skills_container.add_theme_constant_override("separation", 10)
	add_child(skills_container)
	
	skill_desc_label = Label.new()
	skill_desc_label.position = Vector2(72, 760)
	skill_desc_label.size = Vector2(1072, 80)
	skill_desc_label.add_theme_font_size_override("font_size", 26)
	skill_desc_label.add_theme_color_override("font_color", Color(0.9, 0.85, 0.7))
	skill_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(skill_desc_label)

func open() -> void:
	party_index = 0
	skill_cursor = 0
	visible = true
	refresh_display()

func refresh_display() -> void:
	if GameState.party.is_empty():
		return
		
	var hero: Dictionary = GameState.party[party_index]
	frame_ctrl.title = "強 さ（能力） - %d/%d" % [party_index + 1, GameState.party.size()]
	
	name_label.text = hero.get("name", "")
	title_label.text = "【%s】" % hero.get("title", "")
	job_label.text = "職業: %s   Lv.%d   EXP: %d (次まで %d)" % [
		hero.get("job", ""),
		hero.get("level", 1),
		hero.get("exp", 0),
		hero.get("nextExp", 30) - hero.get("exp", 0)
	]
	
	var sprite_key: String = hero.get("spriteKey", "")
	var p_path := "res://assets/portraits/%s.png" % sprite_key
	if ResourceLoader.exists(p_path):
		portrait_rect.texture = load(p_path)
		
	# パラメータ再描画
	for c in stats_grid.get_children():
		c.queue_free()
		
	var stats := [
		"H P: %d / %d" % [hero.get("hp", 0), hero.get("maxHp", 0)],
		"攻撃力: %d" % hero.get("atk", 0),
		"精神力: %d" % hero.get("matk", 0),
		"M P: %d / %d" % [hero.get("mp", 0), hero.get("maxMp", 0)],
		"防御力: %d" % hero.get("def", 0),
		"素早さ: %d" % hero.get("spd", 0)
	]
	for s in stats:
		var lbl := Label.new()
		lbl.text = s
		lbl.add_theme_font_size_override("font_size", 32)
		lbl.add_theme_color_override("font_color", Color.WHITE)
		stats_grid.add_child(lbl)
		
	# 技一覧再描画
	for c in skills_container.get_children():
		c.queue_free()
		
	var skills: Array = hero.get("skills", [])
	for i in range(skills.size()):
		var sk_id: String = skills[i]
		var sk_data: Dictionary = MasterData.get_skill(sk_id)
		var prefix := "▶ " if i == skill_cursor else "   "
		var lbl := Label.new()
		lbl.text = "%s%s (%d MP)" % [prefix, sk_data.get("name", ""), sk_data.get("mpCost", 0)]
		lbl.add_theme_font_size_override("font_size", 28)
		lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.4) if i == skill_cursor else Color.WHITE)
		skills_container.add_child(lbl)
		
	if skill_cursor < skills.size():
		var sel_sk: Dictionary = MasterData.get_skill(skills[skill_cursor])
		skill_desc_label.text = "【%s】: %s" % [sel_sk.get("name", ""), sel_sk.get("desc", "")]
	else:
		skill_desc_label.text = ""

func handle_custom_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_echo():
		return
		
	var hero: Dictionary = GameState.party[party_index]
	var skills: Array = hero.get("skills", [])
	
	if event.is_action_pressed("ui_left"):
		party_index = (party_index - 1 + GameState.party.size()) % GameState.party.size()
		skill_cursor = 0
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("ui_right"):
		party_index = (party_index + 1) % GameState.party.size()
		skill_cursor = 0
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("ui_up") and not skills.is_empty():
		skill_cursor = (skill_cursor - 1 + skills.size()) % skills.size()
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("ui_down") and not skills.is_empty():
		skill_cursor = (skill_cursor + 1) % skills.size()
		AudioManager.play_se("se_cursor")
		refresh_display()
	elif event.is_action_pressed("cancel") or event.is_action_pressed("confirm"):
		AudioManager.play_se("se_cancel")
		close()

func close() -> void:
	visible = false
	closed.emit()
