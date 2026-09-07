extends Node2D

## 戦闘シーン (BattleScene)
## 王道JRPGレイアウト、横並びステータスカード、確定計算式、敵AI重み付き抽選、全滅復帰

var party: Array = []
var enemies: Array = []
var is_boss: bool = false
var return_chapter: int = 1

var phase: String = "INTRO" # INTRO, INPUT, ACTION_PLAYBACK, VICTORY, DEFEAT, ESCAPE
var current_actor_idx: int = 0
var command_cursor: int = 0
var action_queue: Array = []
var current_action_idx: int = 0

var selected_skill: Dictionary = {}
var is_selecting_skill: bool = false
var skill_cursor: int = 0

var is_selecting_target: bool = false
var target_type: String = "enemy" # "enemy" or "ally"
var target_cursor: int = 0
var pending_action: Dictionary = {}
var target_indicator: Label
var target_base_y: float = 0.0

@onready var bg_rect: ColorRect = $BGRect
@onready var enemy_container: Control = $EnemyContainer
@onready var party_container: Control = $PartyContainer
@onready var message_log: Label = $LogFrame/MessageLog
@onready var command_window: Control = $CommandWindow
@onready var command_list: VBoxContainer = $CommandWindow/VBoxContainer
@onready var actor_name_label: Label = $CommandWindow/ActorNameLabel
@onready var skill_window: Control = $SkillWindow
@onready var skill_list: VBoxContainer = $SkillWindow/VBoxContainer

const COMMANDS := ["こうげき", "わざ・じゅつ", "どうぐ", "にげる"]

func _ready() -> void:
	target_indicator = Label.new()
	target_indicator.text = "▼"
	target_indicator.add_theme_font_size_override("font_size", 44)
	target_indicator.add_theme_color_override("font_color", Color(1.0, 0.85, 0.2))
	target_indicator.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	target_indicator.add_theme_constant_override("shadow_offset_x", 2)
	target_indicator.add_theme_constant_override("shadow_offset_y", 2)
	target_indicator.visible = false
	target_indicator.z_index = 30
	add_child(target_indicator)
	
	AudioManager.play_bgm("bgm_battle")
	setup_battle(SceneManager.battle_params)

func _process(_delta: float) -> void:
	if is_selecting_target and target_indicator and target_indicator.visible:
		target_indicator.position.y = target_base_y + sin(Time.get_ticks_msec() * 0.008) * 6.0

func setup_battle(params: Dictionary) -> void:
	is_boss = params.get("is_boss", false)
	return_chapter = GameState.current_chapter
	
	# 1. パーティの初期化とバフ 1.0
	party.clear()
	for i in range(GameState.party.size()):
		var p: Dictionary = GameState.party[i]
		var hero: Dictionary = p.duplicate(true)
		hero["index"] = i
		hero["buffAtk"] = 1.0
		hero["buffDef"] = 1.0
		hero["buffSpd"] = 1.0
		hero["hasEvasion"] = false
		party.append(hero)
		
	# 2. 敵の生成とバフ 1.0
	enemies.clear()
	var enemy_ids: Array = params.get("enemy_ids", ["karakasa"])
	for i in range(enemy_ids.size()):
		var eid: String = enemy_ids[i]
		var e_master: Dictionary = MasterData.get_enemy(eid)
		if e_master.is_empty():
			e_master = MasterData.get_enemy("karakasa")
		var enemy: Dictionary = e_master.duplicate(true)
		enemy["index"] = i
		enemy["buffAtk"] = 1.0
		enemy["buffDef"] = 1.0
		enemy["buffSpd"] = 1.0
		enemy["hasEvasion"] = false
		enemies.append(enemy)
		
	phase = "INTRO"
	message_log.text = "魔物が現れた！\nどう行動する？"
	render_sprites()
	render_party_cards()
	
	await get_tree().create_timer(0.8).timeout
	begin_input_phase()

func begin_input_phase() -> void:
	phase = "INPUT"
	current_actor_idx = 0
	action_queue.clear()
	command_cursor = 0
	is_selecting_skill = false
	prompt_actor_input()

func prompt_actor_input() -> void:
	# 行動不能（HP0）なら次の味方へ
	while current_actor_idx < party.size() and party[current_actor_idx]["hp"] <= 0:
		current_actor_idx += 1
		
	if current_actor_idx >= party.size():
		# 全員入力完了 → 行動再生へ
		start_action_playback()
		return
		
	var hero: Dictionary = party[current_actor_idx]
	actor_name_label.text = "【%s】" % hero.get("name", "")
	command_cursor = 0
	is_selecting_skill = false
	command_window.visible = true
	skill_window.visible = false
	refresh_commands()
	render_party_cards()

func refresh_commands() -> void:
	var children := command_list.get_children()
	while children.size() > COMMANDS.size():
		var extra = children.pop_back()
		extra.queue_free()
		
	for i in range(COMMANDS.size()):
		var prefix := "▶ " if i == command_cursor else "   "
		var text_val: String = prefix + COMMANDS[i]
		var col := Color(1, 0.9, 0.4) if i == command_cursor else Color.WHITE
		
		var lbl: Label
		if i < children.size():
			lbl = children[i] as Label
		else:
			lbl = Label.new()
			lbl.add_theme_font_size_override("font_size", 34)
			lbl.mouse_filter = Control.MOUSE_FILTER_STOP
			var cmd_idx := i
			lbl.gui_input.connect(func(ev: InputEvent) -> void:
				if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
					if command_cursor == cmd_idx:
						execute_command()
					else:
						command_cursor = cmd_idx
						AudioManager.play_se("se_cursor")
						refresh_commands()
			)
			command_list.add_child(lbl)
			
		lbl.text = text_val
		lbl.add_theme_color_override("font_color", col)

func refresh_skills() -> void:
	var hero: Dictionary = party[current_actor_idx]
	var skills: Array = hero.get("skills", [])
	var children := skill_list.get_children()
	while children.size() > skills.size():
		var extra = children.pop_back()
		extra.queue_free()
		
	for i in range(skills.size()):
		var sk: Dictionary = MasterData.get_skill(skills[i])
		var prefix := "▶ " if i == skill_cursor else "   "
		var text_val: String = "%s%s (%d MP)" % [prefix, sk.get("name", ""), sk.get("mpCost", 0)]
		var col := Color(1, 0.9, 0.4) if i == skill_cursor else Color.WHITE
		
		var lbl: Label
		if i < children.size():
			lbl = children[i] as Label
		else:
			lbl = Label.new()
			lbl.add_theme_font_size_override("font_size", 28)
			lbl.mouse_filter = Control.MOUSE_FILTER_STOP
			var s_idx := i
			lbl.gui_input.connect(func(ev: InputEvent) -> void:
				if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
					if skill_cursor == s_idx:
						_confirm_current_skill()
					else:
						skill_cursor = s_idx
						AudioManager.play_se("se_cursor")
						refresh_skills()
			)
			skill_list.add_child(lbl)
			
		lbl.text = text_val
		lbl.add_theme_color_override("font_color", col)

func _unhandled_input(event: InputEvent) -> void:
	if phase != "INPUT":
		return
		
	if is_selecting_target:
		handle_target_input(event)
	elif is_selecting_skill:
		handle_skill_input(event)
	else:
		handle_command_input(event)

func handle_command_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_up"):
		command_cursor = (command_cursor - 1 + COMMANDS.size()) % COMMANDS.size()
		AudioManager.play_se("se_cursor")
		refresh_commands()
	elif event.is_action_pressed("ui_down"):
		command_cursor = (command_cursor + 1) % COMMANDS.size()
		AudioManager.play_se("se_cursor")
		refresh_commands()
	elif event.is_action_pressed("confirm"):
		execute_command()
	elif event.is_action_pressed("cancel") and current_actor_idx > 0:
		# 前のキャラのコマンドに戻る
		AudioManager.play_se("se_cancel")
		current_actor_idx -= 1
		action_queue.pop_back()
		prompt_actor_input()

func execute_command() -> void:
	AudioManager.play_se("se_select")
	match command_cursor:
		0:
			# こうげき -> 敵対象選択へ
			start_target_selection("enemy", {
				"side": "party",
				"actor_idx": current_actor_idx,
				"action_type": "attack"
			})
		1:
			# わざ・じゅつ
			var hero: Dictionary = party[current_actor_idx]
			if hero.get("skills", []).is_empty():
				AudioManager.play_se("se_cancel")
				return
			is_selecting_skill = true
			is_selecting_target = false
			hide_target_indicator()
			skill_cursor = 0
			command_window.visible = false
			skill_window.visible = true
			refresh_skills()
		2:
			# どうぐ
			var found_item: Dictionary = {}
			for it in GameState.items:
				if it.get("count", 0) > 0 and it.get("type") == "heal_hp":
					found_item = it
					break
			if not found_item.is_empty():
				start_target_selection("ally", {
					"side": "party",
					"actor_idx": current_actor_idx,
					"action_type": "item",
					"item": found_item
				})
			else:
				AudioManager.play_se("se_cancel")
				message_log.text = "使える道具がありません！"
		3:
			# にげる
			action_queue.append({
				"side": "party",
				"actor_idx": current_actor_idx,
				"action_type": "escape"
			})
			current_actor_idx += 1
			prompt_actor_input()

func handle_skill_input(event: InputEvent) -> void:
	var hero: Dictionary = party[current_actor_idx]
	var skills: Array = hero.get("skills", [])
	
	if event.is_action_pressed("ui_up"):
		skill_cursor = (skill_cursor - 1 + skills.size()) % skills.size()
		AudioManager.play_se("se_cursor")
		refresh_skills()
	elif event.is_action_pressed("ui_down"):
		skill_cursor = (skill_cursor + 1) % skills.size()
		AudioManager.play_se("se_cursor")
		refresh_skills()
	elif event.is_action_pressed("confirm"):
		_confirm_current_skill()
	elif event.is_action_pressed("cancel"):
		AudioManager.play_se("se_cancel")
		is_selecting_skill = false
		command_window.visible = true
		skill_window.visible = false
		refresh_commands()

func _confirm_current_skill() -> void:
	var hero: Dictionary = party[current_actor_idx]
	var skills: Array = hero.get("skills", [])
	if skill_cursor < 0 or skill_cursor >= skills.size():
		return
	var sk: Dictionary = MasterData.get_skill(skills[skill_cursor])
	if hero.get("mp", 0) < sk.get("mpCost", 0):
		AudioManager.play_se("se_cancel")
		message_log.text = "MPが足りません！"
		return
		
	var sk_target: String = sk.get("target", "enemy_single")
	AudioManager.play_se("se_select")
	if sk_target == "enemy_single":
		is_selecting_skill = false
		start_target_selection("enemy", {
			"side": "party",
			"actor_idx": current_actor_idx,
			"action_type": "skill",
			"skill": sk
		})
	elif sk_target == "ally_single":
		is_selecting_skill = false
		start_target_selection("ally", {
			"side": "party",
			"actor_idx": current_actor_idx,
			"action_type": "skill",
			"skill": sk
		})
	else:
		# 全体効果
		action_queue.append({
			"side": "party",
			"actor_idx": current_actor_idx,
			"action_type": "skill",
			"skill": sk,
			"target_idx": -1
		})
		is_selecting_skill = false
		skill_window.visible = false
		current_actor_idx += 1
		prompt_actor_input()

func start_target_selection(type: String, action: Dictionary) -> void:
	var living: Array = get_living_enemies() if type == "enemy" else get_living_party()
	if living.is_empty():
		return
		
	is_selecting_target = true
	target_type = type
	pending_action = action
	target_cursor = 0
	
	if target_type == "ally":
		for i in range(living.size()):
			if living[i].get("hp", 0) < living[i].get("maxHp", 0):
				target_cursor = i
				break
				
	command_window.visible = true
	skill_window.visible = false
	refresh_target_ui()

func refresh_target_ui() -> void:
	if target_type == "enemy":
		actor_name_label.text = "【敵を選択】"
		var living_e: Array = get_living_enemies()
		if living_e.is_empty():
			cancel_target_selection()
			return
		if target_cursor >= living_e.size():
			target_cursor = max(0, living_e.size() - 1)
			
		var children := command_list.get_children()
		while children.size() > living_e.size():
			var extra = children.pop_back()
			extra.queue_free()
			
		for i in range(living_e.size()):
			var e: Dictionary = living_e[i]
			var prefix := "▶ " if i == target_cursor else "   "
			var text_val: String = "%s%s" % [prefix, e.get("name", "魔物")]
			var col := Color(1, 0.9, 0.4) if i == target_cursor else Color.WHITE
			
			var lbl: Label
			if i < children.size():
				lbl = children[i] as Label
			else:
				lbl = Label.new()
				lbl.add_theme_font_size_override("font_size", 32)
				lbl.mouse_filter = Control.MOUSE_FILTER_STOP
				var t_idx := i
				lbl.gui_input.connect(func(ev: InputEvent) -> void:
					if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
						if target_cursor == t_idx:
							confirm_target_selection()
						else:
							target_cursor = t_idx
							AudioManager.play_se("se_cursor")
							refresh_target_ui()
				)
				command_list.add_child(lbl)
				
			lbl.text = text_val
			lbl.add_theme_color_override("font_color", col)
			
		update_target_indicator_enemy(living_e[target_cursor])
	else:
		actor_name_label.text = "【味方を選択】"
		var living_p: Array = get_living_party()
		if living_p.is_empty():
			cancel_target_selection()
			return
		if target_cursor >= living_p.size():
			target_cursor = max(0, living_p.size() - 1)
			
		var children := command_list.get_children()
		while children.size() > living_p.size():
			var extra = children.pop_back()
			extra.queue_free()
			
		for i in range(living_p.size()):
			var p: Dictionary = living_p[i]
			var prefix := "▶ " if i == target_cursor else "   "
			var text_val: String = "%s%s (%d/%d)" % [prefix, p.get("name", "仲間"), p.get("hp", 0), p.get("maxHp", 0)]
			var col := Color(1, 0.9, 0.4) if i == target_cursor else Color.WHITE
			
			var lbl: Label
			if i < children.size():
				lbl = children[i] as Label
			else:
				lbl = Label.new()
				lbl.add_theme_font_size_override("font_size", 30)
				lbl.mouse_filter = Control.MOUSE_FILTER_STOP
				var t_idx := i
				lbl.gui_input.connect(func(ev: InputEvent) -> void:
					if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
						if target_cursor == t_idx:
							confirm_target_selection()
						else:
							target_cursor = t_idx
							AudioManager.play_se("se_cursor")
							refresh_target_ui()
				)
				command_list.add_child(lbl)
				
			lbl.text = text_val
			lbl.add_theme_color_override("font_color", col)
			
		update_target_indicator_ally(living_p[target_cursor])

func get_enemy_pos(idx: int, total: int, size: float) -> Vector2:
	var area_left := 60.0
	var area_right := 540.0
	var area_width := area_right - area_left
	var y := 240.0
	if total <= 1:
		return Vector2(area_left + (area_width - size) / 2.0, y)
	var step := (area_width - size) / float(total - 1)
	return Vector2(area_left + idx * step, y)

func update_target_indicator_enemy(enemy: Dictionary) -> void:
	if enemy.is_empty() or not target_indicator:
		hide_target_indicator()
		return
	var idx: int = enemy.get("index", 0)
	var size := 192.0 if is_boss else 128.0
	var pos := get_enemy_pos(idx, enemies.size(), size)
	var ex := pos.x + (size / 2.0) - 18.0
	target_base_y = pos.y - 54.0
	target_indicator.position = Vector2(ex, target_base_y)
	target_indicator.visible = true

func update_target_indicator_ally(hero: Dictionary) -> void:
	if hero.is_empty() or not target_indicator:
		hide_target_indicator()
		return
	var idx: int = hero.get("index", 0)
	target_base_y = 60.0 + idx * 164.0 + 36.0
	var hx := 1040.0 - idx * 36.0 - 50.0
	target_indicator.position = Vector2(hx, target_base_y)
	target_indicator.visible = true

func hide_target_indicator() -> void:
	if target_indicator:
		target_indicator.visible = false

func handle_target_input(event: InputEvent) -> void:
	var living: Array = get_living_enemies() if target_type == "enemy" else get_living_party()
	if living.is_empty():
		cancel_target_selection()
		return
		
	if event.is_action_pressed("ui_up") or event.is_action_pressed("ui_left"):
		target_cursor = (target_cursor - 1 + living.size()) % living.size()
		AudioManager.play_se("se_cursor")
		refresh_target_ui()
	elif event.is_action_pressed("ui_down") or event.is_action_pressed("ui_right"):
		target_cursor = (target_cursor + 1) % living.size()
		AudioManager.play_se("se_cursor")
		refresh_target_ui()
	elif event.is_action_pressed("confirm"):
		confirm_target_selection()
	elif event.is_action_pressed("cancel"):
		cancel_target_selection()

func confirm_target_selection() -> void:
	var living: Array = get_living_enemies() if target_type == "enemy" else get_living_party()
	if living.is_empty():
		cancel_target_selection()
		return
		
	var chosen: Dictionary = living[target_cursor]
	var t_idx: int = chosen.get("index", 0)
	
	AudioManager.play_se("se_select")
	pending_action["target_idx"] = t_idx
	
	if pending_action.get("action_type") == "item":
		var it: Dictionary = pending_action.get("item", {})
		it["count"] = max(0, it.get("count", 0) - 1)
		
	action_queue.append(pending_action)
	is_selecting_target = false
	hide_target_indicator()
	current_actor_idx += 1
	prompt_actor_input()

func cancel_target_selection() -> void:
	AudioManager.play_se("se_cancel")
	is_selecting_target = false
	hide_target_indicator()
	
	if pending_action.get("action_type") == "skill":
		is_selecting_skill = true
		command_window.visible = false
		skill_window.visible = true
		refresh_skills()
	else:
		is_selecting_skill = false
		skill_window.visible = false
		command_window.visible = true
		refresh_commands()

func start_action_playback() -> void:
	phase = "ACTION_PLAYBACK"
	is_selecting_target = false
	is_selecting_skill = false
	hide_target_indicator()
	command_window.visible = false
	skill_window.visible = false
	
	# 敵のAI行動を決定しキューに追加 (指示書§4(4): actions[].rate による重み付き抽選)
	for i in range(enemies.size()):
		var e: Dictionary = enemies[i]
		if e.get("hp", 0) > 0:
			var act: Dictionary = select_enemy_action(e)
			action_queue.append({
				"side": "enemy",
				"actor_idx": i,
				"action_type": "enemy_action",
				"action_data": act,
				"target_idx": get_random_alive_party_idx()
			})
			
	# 行動順ソート (指示書§4(2): spd * buffSpd による厳密ソート)
	action_queue.sort_custom(func(a, b):
		var spd_a: float = get_actor_speed(a)
		var spd_b: float = get_actor_speed(b)
		return spd_a > spd_b
	)
	
	current_action_idx = 0
	execute_next_action()

func get_actor_speed(act: Dictionary) -> float:
	if act["side"] == "party":
		var hero: Dictionary = party[act["actor_idx"]]
		return float(hero.get("spd", 10)) * float(hero.get("buffSpd", 1.0))
	else:
		var enemy: Dictionary = enemies[act["actor_idx"]]
		return float(enemy.get("spd", 10)) * float(enemy.get("buffSpd", 1.0))

func select_enemy_action(enemy: Dictionary) -> Dictionary:
	var actions: Array = enemy.get("actions", [])
	if actions.is_empty():
		return {"name": "攻撃", "type": "attack", "power": 1.0}
		
	var total_rate := 0.0
	for a in actions:
		total_rate += float(a.get("rate", 1.0))
		
	var roll := randf() * total_rate
	var acc := 0.0
	for a in actions:
		acc += float(a.get("rate", 1.0))
		if roll <= acc:
			return a
	return actions[0]

func execute_next_action() -> void:
	if check_battle_end():
		return
		
	if current_action_idx >= action_queue.size():
		begin_input_phase()
		return
		
	var act: Dictionary = action_queue[current_action_idx]
	current_action_idx += 1
	
	if act["side"] == "party":
		var hero: Dictionary = party[act["actor_idx"]]
		if hero.get("hp", 0) <= 0:
			execute_next_action()
			return
			
		match act["action_type"]:
			"attack":
				perform_party_attack(hero, act["target_idx"])
			"skill":
				perform_party_skill(hero, act["skill"], act["target_idx"])
			"item":
				perform_party_item(hero, act["item"], act["target_idx"])
			"escape":
				perform_escape()
	else:
		var enemy: Dictionary = enemies[act["actor_idx"]]
		if enemy.get("hp", 0) <= 0:
			execute_next_action()
			return
		perform_enemy_action(enemy, act["action_data"], act["target_idx"])

func perform_party_attack(hero: Dictionary, target_idx: int) -> void:
	if target_idx >= enemies.size() or enemies[target_idx]["hp"] <= 0:
		target_idx = get_first_alive_enemy_idx()
	if target_idx == -1:
		execute_next_action()
		return
		
	var target: Dictionary = enemies[target_idx]
	var variance: int = randi_range(-2, 2)
	var dmg: int = max(1, int(hero["atk"] * hero["buffAtk"] * 1.4 - target["def"] * target["buffDef"] * 0.7 + variance))
	target["hp"] = max(0, target["hp"] - dmg)
	
	AudioManager.play_se("se_hit")
	if target["hp"] <= 0:
		AudioManager.play_se("se_enemy_dead")
	message_log.text = "%sの攻撃！\n%sに %d のダメージ！" % [hero["name"], target["name"], dmg]
	render_sprites()
	render_party_cards()
	
	await get_tree().create_timer(0.6).timeout
	execute_next_action()

func perform_party_skill(hero: Dictionary, skill: Dictionary, target_idx: int) -> void:
	hero["mp"] = max(0, hero["mp"] - skill["mpCost"])
	AudioManager.play_se("se_magic" if skill.get("type") == "magical" else "se_slash")
	
	var sk_target: String = skill.get("target", "enemy_single")
	if sk_target == "enemy_all":
		var living := get_living_enemies()
		for e in living:
			var variance: int = randi_range(-3, 3)
			var dmg: int = 1
			if skill.get("type") == "physical":
				dmg = max(1, int(hero["atk"] * hero["buffAtk"] * 1.4 * skill["power"] - e["def"] * e["buffDef"] * 0.5 + variance))
			else:
				dmg = max(1, int(hero["matk"] * 1.8 * skill["power"] - e["def"] * e["buffDef"] * 0.4 + variance))
			e["hp"] = max(0, e["hp"] - dmg)
			if e["hp"] <= 0:
				AudioManager.play_se("se_enemy_dead")
		message_log.text = "%sの【%s】！\n敵全体を薙ぎ払った！" % [hero["name"], skill["name"]]
		render_sprites()
		render_party_cards()
		await get_tree().create_timer(0.6).timeout
		execute_next_action()
		return
		
	if skill.get("type") == "heal":
		var target_hero: Dictionary = party[target_idx] if (target_idx >= 0 and target_idx < party.size()) else hero
		var heal_amt: int = int(skill["power"] + hero["matk"] * 1.2)
		target_hero["hp"] = min(target_hero["maxHp"], target_hero["hp"] + heal_amt)
		message_log.text = "%sの【%s】！\n%sのHPが %d 回復した！" % [hero["name"], skill["name"], target_hero["name"], heal_amt]
		render_party_cards()
		await get_tree().create_timer(0.6).timeout
		execute_next_action()
		return

	if target_idx >= enemies.size() or enemies[target_idx]["hp"] <= 0:
		target_idx = get_first_alive_enemy_idx()
	if target_idx == -1:
		execute_next_action()
		return
		
	var target: Dictionary = enemies[target_idx]
	var variance: int = randi_range(-3, 3)
	var dmg: int = 1
	# 物理・魔法分岐 (指示書§4(1) 必須仕様)
	if skill.get("type") == "physical":
		dmg = max(1, int(hero["atk"] * hero["buffAtk"] * 1.4 * skill["power"] - target["def"] * target["buffDef"] * 0.5 + variance))
	elif skill.get("type") == "magical":
		dmg = max(1, int(hero["matk"] * 1.8 * skill["power"] - target["def"] * target["buffDef"] * 0.4 + variance))
		
	target["hp"] = max(0, target["hp"] - dmg)
	if target["hp"] <= 0:
		AudioManager.play_se("se_enemy_dead")
	message_log.text = "%sの【%s】！\n%sに %d の大打撃！" % [hero["name"], skill["name"], target["name"], dmg]
	render_sprites()
	render_party_cards()
	
	await get_tree().create_timer(0.6).timeout
	execute_next_action()

func perform_party_item(hero: Dictionary, item: Dictionary, target_idx: int) -> void:
	var target_hero: Dictionary = party[target_idx] if (target_idx >= 0 and target_idx < party.size()) else hero
	target_hero["hp"] = min(target_hero["maxHp"], target_hero["hp"] + item.get("value", 50))
	AudioManager.play_se("se_heal")
	message_log.text = "%sは【%s】を使った！\n%sのHPが回復した！" % [hero["name"], item["name"], target_hero["name"]]
	render_party_cards()
	await get_tree().create_timer(0.6).timeout
	execute_next_action()

func perform_escape() -> void:
	message_log.text = "パーティは煙玉を放ち、\n無事に逃げ出した！"
	AudioManager.play_se("se_cancel")
	await get_tree().create_timer(0.8).timeout
	finish_battle_escape()

func perform_enemy_action(enemy: Dictionary, act: Dictionary, target_idx: int) -> void:
	if target_idx >= party.size() or party[target_idx]["hp"] <= 0:
		target_idx = get_random_alive_party_idx()
	if target_idx == -1:
		execute_next_action()
		return
		
	var target: Dictionary = party[target_idx]
	var act_type: String = act.get("type", "attack")
	
	if act_type == "heal":
		# 自己回復 (指示書§4(5))
		var heal_val: int = int(enemy.get("maxHp", 50) * 0.3)
		enemy["hp"] = min(enemy["maxHp"], enemy["hp"] + heal_val)
		AudioManager.play_se("se_heal")
		message_log.text = "%sは妖術を唱えた！\n魔物の傷が癒えた (HP+%d)" % [enemy["name"], heal_val]
	elif act_type == "defend":
		# 防御バフ (指示書§4(5))
		enemy["buffDef"] = 1.45
		AudioManager.play_se("se_hit")
		message_log.text = "%sは身を固めた！\n防御力が高まった！" % enemy["name"]
	else:
		# 通常・属性・全体攻撃 (Web版 js/battle.js:765 準拠: power, 1.2係数, 乱数±2)
		var pw: float = float(act.get("power", 1.0))
		var variance: int = randi_range(-2, 2)
		var dmg: int = max(1, int(enemy["atk"] * enemy["buffAtk"] * pw * 1.2 - target["def"] * target["buffDef"] * 0.6 + variance))
		target["hp"] = max(0, target["hp"] - dmg)
		AudioManager.play_se("se_hit")
		message_log.text = "%sの%s！\n%sは %d のダメージを受けた！" % [enemy["name"], act.get("name", "攻撃"), target["name"], dmg]
		
	render_sprites()
	render_party_cards()
	await get_tree().create_timer(0.6).timeout
	execute_next_action()

func check_battle_end() -> bool:
	var all_enemies_dead := true
	for e in enemies:
		if e.get("hp", 0) > 0:
			all_enemies_dead = false
			break
			
	if all_enemies_dead:
		finish_victory()
		return true
		
	var all_party_dead := true
	for p in party:
		if p.get("hp", 0) > 0:
			all_party_dead = false
			break
			
	if all_party_dead:
		finish_defeat()
		return true
		
	return false

func finish_victory() -> void:
	phase = "VICTORY"
	AudioManager.play_se("se_victory")
	AudioManager.stop_bgm()
	
	# ボスフラグ更新
	if is_boss:
		var b_id: String = enemies[0].get("id", "")
		GameState.boss_defeated[b_id] = true
		
	# EXP・所持金獲得
	var total_exp := 12
	var total_money := 20
	for e in enemies:
		total_exp += e.get("exp", 8)
		total_money += e.get("money", 15)
		
	GameState.money += total_money
	for p in party:
		if p.get("hp", 0) > 0:
			p["exp"] += total_exp
			if p["exp"] >= p.get("nextExp", 30):
				p["level"] += 1
				p["maxHp"] += 8
				p["hp"] = p["maxHp"]
				p["atk"] += 3
				p["def"] += 2
				p["matk"] += 2
				p["spd"] += 1
				p["nextExp"] = int(p["nextExp"] * 1.8)
				
	sync_party_to_game_state()
	message_log.text = "戦いに勝利した！\n%d EXP と %d 両を獲得した！" % [total_exp, total_money]
	
	await get_tree().create_timer(1.8).timeout
	SceneManager.change_scene("MAP", {"chapter_num": return_chapter}, 0.5)

func finish_defeat() -> void:
	phase = "DEFEAT"
	AudioManager.stop_bgm()
	message_log.text = "パーティは全滅してしまった……\n千歳杉の神気が白鷺神社へと導く……"
	
	# 敗北時の完全回復復帰 (指示書§4(8)・受入テスト2準拠)
	for p in party:
		p["hp"] = p["maxHp"]
		p["mp"] = p["maxMp"]
	sync_party_to_game_state()
	
	# 各章の復活地点（神社）に座標を設定
	var ch_idx: int = return_chapter - 1
	if ch_idx >= 0 and ch_idx < MasterData.chapters.size():
		var ch_data: Dictionary = MasterData.chapters[ch_idx]
		var rev: Dictionary = ch_data.get("revive", {})
		if not rev.is_empty():
			GameState.player_pos["grid_x"] = rev.get("x", 36)
			GameState.player_pos["grid_y"] = rev.get("y", 8)
			GameState.player_pos["facing"] = rev.get("facing", "down")
	
	await get_tree().create_timer(1.8).timeout
	SceneManager.change_scene("MAP", {"chapter_num": return_chapter}, 0.5)

func finish_battle_escape() -> void:
	sync_party_to_game_state()
	SceneManager.change_scene("MAP", {"chapter_num": return_chapter}, 0.4)

func sync_party_to_game_state() -> void:
	for i in range(party.size()):
		var src: Dictionary = party[i]
		var dst: Dictionary = GameState.party[i]
		dst["hp"] = src["hp"]
		dst["mp"] = src["mp"]
		dst["maxHp"] = src["maxHp"]
		dst["maxMp"] = src["maxMp"]
		dst["level"] = src["level"]
		dst["exp"] = src["exp"]
		dst["nextExp"] = src["nextExp"]
		dst["atk"] = src["atk"]
		dst["def"] = src["def"]
		dst["matk"] = src["matk"]
		dst["spd"] = src["spd"]

func get_first_alive_enemy_idx() -> int:
	for i in range(enemies.size()):
		if enemies[i].get("hp", 0) > 0:
			return i
	return -1

func get_random_alive_party_idx() -> int:
	var alive_indices: Array[int] = []
	for i in range(party.size()):
		if party[i].get("hp", 0) > 0:
			alive_indices.append(i)
	if alive_indices.is_empty():
		return -1
	return alive_indices.pick_random()

func get_living_enemies() -> Array:
	var list: Array = []
	for e in enemies:
		if e.get("hp", 0) > 0:
			list.append(e)
	return list

func get_living_party() -> Array:
	var list: Array = []
	for i in range(party.size()):
		var p: Dictionary = party[i]
		if p.get("hp", 0) > 0:
			var item: Dictionary = p.duplicate()
			item["index"] = i
			list.append(item)
	return list

func _on_enemy_input(event: InputEvent, enemy_idx: int) -> void:
	if not is_selecting_target or target_type != "enemy":
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var living: Array = get_living_enemies()
		for j in range(living.size()):
			if living[j].get("index", -1) == enemy_idx:
				if target_cursor == j:
					confirm_target_selection()
				else:
					target_cursor = j
					AudioManager.play_se("se_cursor")
					refresh_target_ui()
				get_viewport().set_input_as_handled()
				break

func _on_ally_input(event: InputEvent, party_idx: int) -> void:
	if not is_selecting_target or target_type != "ally":
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var living: Array = get_living_party()
		for j in range(living.size()):
			if living[j].get("index", -1) == party_idx:
				if target_cursor == j:
					confirm_target_selection()
				else:
					target_cursor = j
					AudioManager.play_se("se_cursor")
					refresh_target_ui()
				get_viewport().set_input_as_handled()
				break

func render_sprites() -> void:
	for c in enemy_container.get_children():
		c.queue_free()
		
	for i in range(enemies.size()):
		var e: Dictionary = enemies[i]
		if e.get("hp", 0) <= 0:
			continue
		var tr := TextureRect.new()
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		var skey: String = e.get("spriteKey", "karakasa")
		var sp_path := "res://assets/sprites/%s.png" % skey
		if ResourceLoader.exists(sp_path):
			tr.texture = load(sp_path)
		var size := 192.0 if is_boss else 128.0
		var pos := get_enemy_pos(i, enemies.size(), size)
		tr.size = Vector2(size, size)
		tr.custom_minimum_size = Vector2(size, size)
		tr.position = pos
		tr.mouse_filter = Control.MOUSE_FILTER_STOP
		var enemy_idx := i
		tr.gui_input.connect(func(ev: InputEvent) -> void:
			_on_enemy_input(ev, enemy_idx)
		)
		enemy_container.add_child(tr)
		
		# 敵名（中央揃え）
		var lbl := Label.new()
		lbl.text = e.get("name", "")
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.size = Vector2(size + 60, 36)
		lbl.position = Vector2(pos.x - 30, pos.y + size + 8)
		lbl.add_theme_font_size_override("font_size", 28)
		lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.7))
		lbl.mouse_filter = Control.MOUSE_FILTER_STOP
		lbl.gui_input.connect(func(ev: InputEvent) -> void:
			_on_enemy_input(ev, enemy_idx)
		)
		enemy_container.add_child(lbl)

func render_party_cards() -> void:
	for c in party_container.get_children():
		c.queue_free()
		
	for i in range(party.size()):
		var h: Dictionary = party[i]
		var is_dead: bool = (int(h.get("hp", 0)) <= 0)
		var is_act: bool = (phase == "INPUT" and current_actor_idx == i)
		var base_y := 60 + i * 164
		var p_idx := i
		
		# スプライト (128x128)
		var tr := TextureRect.new()
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		var sp_name := "%s_battle_hit" if is_dead else "%s_battle_idle"
		var sp_path := "res://assets/sprites/%s.png" % (sp_name % h.get("spriteKey", "samurai"))
		if ResourceLoader.exists(sp_path):
			tr.texture = load(sp_path)
		tr.size = Vector2(128, 128)
		tr.position = Vector2(1040 - i * 36, base_y)
		tr.mouse_filter = Control.MOUSE_FILTER_STOP
		tr.gui_input.connect(func(ev: InputEvent) -> void:
			_on_ally_input(ev, p_idx)
		)
		party_container.add_child(tr)
		
		# ステータスカード
		var card := Panel.new()
		card.size = Vector2(360, 144)
		card.position = Vector2(1040 - i * 36 - 380, base_y)
		
		var style := StyleBoxFlat.new()
		style.bg_color = Color(0.16, 0.1, 0.22, 0.92) if is_act else Color(0.08, 0.05, 0.1, 0.88)
		style.border_color = Color(1, 0.84, 0.4) if is_act else Color(0.4, 0.3, 0.2)
		style.set_border_width_all(3 if is_act else 1)
		style.set_corner_radius_all(6)
		card.add_theme_stylebox_override("panel", style)
		card.mouse_filter = Control.MOUSE_FILTER_STOP
		card.gui_input.connect(func(ev: InputEvent) -> void:
			_on_ally_input(ev, p_idx)
		)
		party_container.add_child(card)
		
		# カード内テキスト (名前・HP・MP)
		var n_lbl := Label.new()
		n_lbl.text = ("▶ " if is_act else "   ") + h.get("name", "")
		n_lbl.position = Vector2(16, 12)
		n_lbl.add_theme_font_size_override("font_size", 32)
		n_lbl.add_theme_color_override("font_color", Color(1, 0.85, 0.4) if is_act else Color.WHITE)
		card.add_child(n_lbl)
		
		var hp_lbl := Label.new()
		hp_lbl.text = "HP: %d / %d" % [h.get("hp", 0), h.get("maxHp", 0)]
		hp_lbl.position = Vector2(16, 60)
		hp_lbl.add_theme_font_size_override("font_size", 28)
		hp_lbl.add_theme_color_override("font_color", Color(0.4, 1.0, 0.5))
		card.add_child(hp_lbl)
		
		var mp_lbl := Label.new()
		mp_lbl.text = "MP: %d / %d" % [h.get("mp", 0), h.get("maxMp", 0)]
		mp_lbl.position = Vector2(16, 98)
		mp_lbl.add_theme_font_size_override("font_size", 26)
		mp_lbl.add_theme_color_override("font_color", Color(0.5, 0.8, 1.0))
		card.add_child(mp_lbl)
