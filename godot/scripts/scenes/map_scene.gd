extends Node2D

## マップ探索シーン (MapScene)
## 72x48グリッド、3人隊列歩行、NPC対話、エンカウント、章移動

const MAP_W := 72
const MAP_H := 48
const TILE_SIZE := 64

var current_chapter: int = 1
var map_grid: Array = []
var collision_grid: Array = []
var encounter_grid: Array = []
var boss_event_grid: Array = []
var npcs: Array = []

# プレイヤー情報
var player_gx: int = 12
var player_gy: int = 14
var player_pos: Vector2 = Vector2.ZERO
var player_target_pos: Vector2 = Vector2.ZERO
var player_facing: String = "down"
var is_moving: bool = false
var move_speed: float = 240.0
var anim_timer: float = 0.0
var anim_frame: int = 0
var steps_since_encounter: int = 0

# 隊列履歴
var pos_history: Array = []

# ノード参照
@onready var camera: Camera2D = $Camera2D
@onready var tile_layer: Node2D = $TileLayer
@onready var characters_layer: Node2D = $CharactersLayer
@onready var ui_layer: CanvasLayer = $UILayer

var dialog_box: DialogBox
var menu_window: MenuWindow
var item_window: ItemWindow
var status_window: StatusWindow
var tile_textures: Dictionary = {}
var char_textures: Dictionary = {}
var party_sprites: Array[Sprite2D] = []
var npc_nodes: Array[Node2D] = []

func _ready() -> void:
	load_tile_textures()
	load_character_textures()
	setup_ui()
	
	tile_layer.draw.connect(_on_tile_layer_draw)
	
	current_chapter = GameState.current_chapter
	player_gx = GameState.player_pos.get("grid_x", 12)
	player_gy = GameState.player_pos.get("grid_y", 14)
	player_facing = GameState.player_pos.get("facing", "down")
	
	player_pos = Vector2(player_gx * TILE_SIZE, player_gy * TILE_SIZE)
	player_target_pos = player_pos
	
	pos_history.clear()
	for i in range(40):
		pos_history.append({"pos": player_pos, "facing": player_facing})
		
	build_map(current_chapter)
	setup_party_sprites()
	AudioManager.play_bgm("bgm_village")
	update_camera()

func load_character_textures() -> void:
	var dir := DirAccess.open("res://assets/sprites")
	if dir:
		dir.list_dir_begin()
		var file_name := dir.get_next()
		while file_name != "":
			if file_name.ends_with(".png") and not file_name.ends_with(".import"):
				var base_name := file_name.get_basename()
				var tex: Texture2D = load("res://assets/sprites/" + file_name)
				if tex:
					char_textures[base_name] = tex
			file_name = dir.get_next()
			
	# 後方互換性エイリアス登録（マスターデータのspriteKeyと個別ファイル名の整合）
	var aliases := {
		"npc_smith_genzo": "npc_smith",
		"npc_taichi": "npc_boy",
		"npc_merchant_jinbei": "npc_merchant",
		"npc_yone": "npc_grandma",
		"npc_suzu": "npc_miko_apprentice",
		"npc_yugen": "npc_biwa_monk",
		"npc_village_head": "npc_elder",
		"npc_priest": "npc_kannushi",
		"npc_shadow_scout": "npc_kagemaru"
	}
	for alias in aliases:
		var target: String = aliases[alias]
		if char_textures.has(target):
			char_textures[alias] = char_textures[target]

func load_tile_textures() -> void:
	var tile_names := [
		"grass", "dirt", "stone", "water", "wood", "tatami", "roof", "wall",
		"pine", "bamboo", "field", "lantern", "torii_top", "torii_post",
		"shrine_box", "shrine_pillar", "rock", "swamp", "barrier_stone",
		"snow", "ice", "deep_water", "capital_stone", "castle_wall", "void_floor"
	]
	for t in tile_names:
		var p := "res://assets/tiles/%s.png" % t
		if ResourceLoader.exists(p):
			tile_textures[t] = load(p)

func setup_ui() -> void:
	dialog_box = DialogBox.new()
	dialog_box.visible = false
	dialog_box.dialog_finished.connect(_on_dialog_finished)
	ui_layer.add_child(dialog_box)
	
	menu_window = MenuWindow.new()
	menu_window.visible = false
	menu_window.status_requested.connect(_on_status_requested)
	menu_window.item_requested.connect(_on_item_requested)
	menu_window.chapter_move_requested.connect(_on_chapter_move_requested)
	menu_window.save_requested.connect(_on_save_requested)
	ui_layer.add_child(menu_window)
	
	item_window = ItemWindow.new()
	item_window.visible = false
	ui_layer.add_child(item_window)
	
	status_window = StatusWindow.new()
	status_window.visible = false
	ui_layer.add_child(status_window)

func build_map(ch: int) -> void:
	current_chapter = ch
	GameState.current_chapter = ch
	
	map_grid.clear()
	collision_grid.clear()
	encounter_grid.clear()
	boss_event_grid.clear()
	
	for y in range(MAP_H):
		var m_row: Array[String] = []
		var c_row: Array[bool] = []
		var e_row: Array[String] = []
		var b_row: Array[String] = []
		for x in range(MAP_W):
			m_row.append("grass")
			c_row.append(false)
			e_row.append("")
			b_row.append("")
		map_grid.append(m_row)
		collision_grid.append(c_row)
		encounter_grid.append(e_row)
		boss_event_grid.append(b_row)
		
	# 外枠境界
	for y in range(MAP_H):
		for x in range(MAP_W):
			if x == 0 or x == MAP_W - 1 or y == 0 or y == MAP_H - 1:
				map_grid[y][x] = "pine"
				collision_grid[y][x] = true
				
	if ch == 1:
		build_ch1()
	elif ch == 2:
		build_ch2()
	else:
		build_ch3()
		
	# NPC読み込み
	npcs.clear()
	for n in MasterData.npcs:
		if n.get("chapter", 1) == ch:
			npcs.append(n)
			var nx: int = n.get("x", 0)
			var ny: int = n.get("y", 0)
			if ny < MAP_H and nx < MAP_W:
				collision_grid[ny][nx] = true
				
	tile_layer.queue_redraw()
	setup_npc_sprites()

func build_ch1() -> void:
	for x in range(8, 17):
		map_grid[5][x] = "roof"; collision_grid[5][x] = true
		map_grid[6][x] = "wall"; collision_grid[6][x] = true
	for y in range(7, 11):
		for x in range(9, 16):
			map_grid[y][x] = "tatami"
	map_grid[10][12] = "wood"
	for y in range(8, 29):
		map_grid[y][12] = "dirt"; map_grid[y][13] = "dirt"
	for x in range(4, 27):
		map_grid[14][x] = "dirt"; map_grid[15][x] = "dirt"
	for y in range(2, 31):
		map_grid[y][25] = "water"; collision_grid[y][25] = true
	map_grid[14][25] = "wood"; collision_grid[14][25] = false
	map_grid[15][25] = "wood"; collision_grid[15][25] = false
	for x in range(26, 47):
		map_grid[14][x] = "stone"; map_grid[15][x] = "stone"
	map_grid[13][28] = "torii_top"; map_grid[14][28] = "torii_post"
	map_grid[5][36] = "shrine_box"; collision_grid[5][36] = true
	
	# エンカウント領域
	for y in range(30, 47):
		for x in range(4, 36):
			map_grid[y][x] = "bamboo" if (x + y) % 3 == 0 else "grass"
			encounter_grid[y][x] = "bamboo"
	for y in range(18, 47):
		for x in range(36, 57):
			encounter_grid[y][x] = "forest"
			
	# ボス配置
	for y in range(39, 42):
		for x in range(33, 36):
			boss_event_grid[y][x] = "akaoni"
	for y in range(29, 32):
		for x in range(51, 54):
			boss_event_grid[y][x] = "tengu"
	for y in range(20, 25):
		for x in range(63, 67):
			boss_event_grid[y][x] = "youko"

func build_ch2() -> void:
	for y in range(MAP_H):
		for x in range(MAP_W):
			map_grid[y][x] = "water"; collision_grid[y][x] = true
	for y in range(10, 33):
		for x in range(4, 27):
			map_grid[y][x] = "dirt"; collision_grid[y][x] = false
	for y in range(2, 23):
		for x in range(28, 55):
			map_grid[y][x] = "snow"; collision_grid[y][x] = false
			encounter_grid[y][x] = "snow_mountain"
	for y in range(24, 47):
		for x in range(28, 55):
			map_grid[y][x] = "deep_water"; collision_grid[y][x] = false
			encounter_grid[y][x] = "lake_underwater"
	for y in range(14, 35):
		for x in range(56, 71):
			map_grid[y][x] = "stone"; collision_grid[y][x] = false
			encounter_grid[y][x] = "port_coast"
			
	# ボス配置
	for y in range(5, 8):
		for x in range(48, 53):
			boss_event_grid[y][x] = "hyoka"
	for y in range(33, 38):
		for x in range(42, 47):
			boss_event_grid[y][x] = "mizuchi_boss"
	for y in range(22, 27):
		for x in range(62, 67):
			boss_event_grid[y][x] = "shuten"

func build_ch3() -> void:
	for y in range(MAP_H):
		for x in range(MAP_W):
			map_grid[y][x] = "void_floor"; collision_grid[y][x] = true
	for y in range(10, 37):
		for x in range(4, 25):
			map_grid[y][x] = "capital_stone"; collision_grid[y][x] = false
			encounter_grid[y][x] = "capital_street"
	for y in range(10, 37):
		for x in range(26, 48):
			map_grid[y][x] = "castle_wall"; collision_grid[y][x] = false
			encounter_grid[y][x] = "demon_castle"
	for y in range(14, 35):
		for x in range(50, 70):
			map_grid[y][x] = "void_floor"; collision_grid[y][x] = false
			encounter_grid[y][x] = "nether_abyss"
			
	# ボス配置
	for y in range(20, 25):
		for x in range(20, 24):
			boss_event_grid[y][x] = "ibaraki"
	for y in range(20, 25):
		for x in range(43, 47):
			boss_event_grid[y][x] = "musokage"
	for y in range(22, 27):
		for x in range(64, 68):
			boss_event_grid[y][x] = "shin_youko"

func _process(delta: float) -> void:
	var is_ui_open := dialog_box.visible or menu_window.visible or item_window.visible or status_window.visible
	
	if is_moving:
		player_pos = player_pos.move_toward(player_target_pos, move_speed * delta)
		anim_timer += delta * 8.0
		anim_frame = int(anim_timer) % 4
		if player_pos == player_target_pos:
			is_moving = false
			player_gx = int(round(player_pos.x / TILE_SIZE))
			player_gy = int(round(player_pos.y / TILE_SIZE))
			GameState.player_pos["grid_x"] = player_gx
			GameState.player_pos["grid_y"] = player_gy
			GameState.player_pos["facing"] = player_facing
			on_step_completed()
	elif not is_ui_open:
		handle_movement_input()
		
	# 隊列履歴更新
	if pos_history.is_empty() or pos_history[0]["pos"] != player_pos:
		pos_history.push_front({"pos": player_pos, "facing": player_facing})
		if pos_history.size() > 50:
			pos_history.pop_back()
			
	update_party_sprites()
	update_camera()
	tile_layer.queue_redraw()

func _on_tile_layer_draw() -> void:
	var half_w := 1280.0 / 2.0
	var half_h := 960.0 / 2.0
	var start_x := clampi(int((camera.position.x - half_w) / TILE_SIZE) - 1, 0, MAP_W - 1)
	var end_x := clampi(int((camera.position.x + half_w) / TILE_SIZE) + 1, 0, MAP_W - 1)
	var start_y := clampi(int((camera.position.y - half_h) / TILE_SIZE) - 1, 0, MAP_H - 1)
	var end_y := clampi(int((camera.position.y + half_h) / TILE_SIZE) + 1, 0, MAP_H - 1)
	
	var base_key := "grass"
	if current_chapter == 2:
		base_key = "water"
	elif current_chapter == 3:
		base_key = "void_floor"
	var base_tile: Texture2D = tile_textures.get(base_key)
	
	for y in range(start_y, end_y + 1):
		for x in range(start_x, end_x + 1):
			var pos := Vector2(x * TILE_SIZE, y * TILE_SIZE)
			var t_key: String = map_grid[y][x]
			
			if t_key in ["pine", "bamboo", "lantern", "torii_top", "torii_post", "shrine_box", "shrine_pillar", "rock"]:
				if base_tile:
					tile_layer.draw_texture(base_tile, pos)
					
			if tile_textures.has(t_key):
				tile_layer.draw_texture(tile_textures[t_key], pos)
			elif base_tile:
				tile_layer.draw_texture(base_tile, pos)

func setup_party_sprites() -> void:
	for s in party_sprites:
		s.queue_free()
	party_sprites.clear()
	
	# 描画順: 朧(ninja) -> 小夜(miko) -> 疾風(samurai) （疾風が最前面）
	var heroes := ["ninja", "miko", "samurai"]
	for i in range(heroes.size()):
		var s := Sprite2D.new()
		s.name = "Party_" + heroes[i]
		s.centered = false
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		
		# 影
		var shadow := Polygon2D.new()
		var pts := PackedVector2Array()
		for j in range(12):
			var a := j * TAU / 12.0
			pts.append(Vector2(32.0 + cos(a) * 16.0, 56.0 + sin(a) * 6.0))
		shadow.polygon = pts
		shadow.color = Color(0, 0, 0, 0.35)
		shadow.show_behind_parent = true
		s.add_child(shadow)
		
		var init_tex = char_textures.get("%s_walk_down_0" % heroes[i])
		if init_tex:
			s.texture = init_tex
		s.position = player_pos
		characters_layer.add_child(s)
		party_sprites.append(s)

func setup_npc_sprites() -> void:
	for n_node in npc_nodes:
		n_node.queue_free()
	npc_nodes.clear()
	
	for n in npcs:
		var nx: int = n.get("x", 0) * TILE_SIZE
		var ny: int = n.get("y", 0) * TILE_SIZE
		var sp_key: String = n.get("spriteKey", "npc_elder")
		
		var container := Node2D.new()
		container.name = "NPC_" + str(n.get("id", sp_key))
		container.position = Vector2(nx, ny)
		
		# 影
		var shadow := Polygon2D.new()
		var pts := PackedVector2Array()
		for j in range(12):
			var a := j * TAU / 12.0
			pts.append(Vector2(32.0 + cos(a) * 16.0, 56.0 + sin(a) * 6.0))
		shadow.polygon = pts
		shadow.color = Color(0, 0, 0, 0.35)
		container.add_child(shadow)
		
		var s := Sprite2D.new()
		s.centered = false
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		var tex = char_textures.get(sp_key)
		if tex:
			s.texture = tex
		container.add_child(s)
		
		characters_layer.add_child(container)
		npc_nodes.append(container)

func update_party_sprites() -> void:
	if party_sprites.size() < 3:
		return
		
	var walk_frame := 0
	if is_moving:
		walk_frame = anim_frame % 2
		
	# party_sprites: 0=ninja(朧), 1=miko(小夜), 2=samurai(疾風)
	var configs := [
		{"prefix": "ninja", "hist_idx": 24, "idx": 0},
		{"prefix": "miko", "hist_idx": 12, "idx": 1},
		{"prefix": "samurai", "hist_idx": 0, "idx": 2}
	]
	
	for cfg in configs:
		var pos: Vector2 = player_pos
		var facing: String = player_facing
		var h_idx: int = cfg["hist_idx"]
		if h_idx > 0 and pos_history.size() > h_idx:
			pos = pos_history[h_idx]["pos"]
			facing = pos_history[h_idx]["facing"]
		elif h_idx > 0 and not pos_history.is_empty():
			pos = pos_history.back()["pos"]
			facing = pos_history.back()["facing"]
			
		var frame_to_use := walk_frame if is_moving else 0
		var sp_key := "%s_walk_%s_%d" % [cfg["prefix"], facing, frame_to_use]
		var spr: Sprite2D = party_sprites[cfg["idx"]]
		spr.position = pos
		if char_textures.has(sp_key):
			spr.texture = char_textures[sp_key]

func handle_movement_input() -> void:
	var dx := 0
	var dy := 0
	
	if Input.is_action_pressed("ui_up"):
		dy = -1
		player_facing = "up"
	elif Input.is_action_pressed("ui_down"):
		dy = 1
		player_facing = "down"
	elif Input.is_action_pressed("ui_left"):
		dx = -1
		player_facing = "left"
	elif Input.is_action_pressed("ui_right"):
		dx = 1
		player_facing = "right"
		
	if dx != 0 or dy != 0:
		var tgx: int = player_gx + dx
		var tgy: int = player_gy + dy
		if can_move_to(tgx, tgy):
			player_target_pos = Vector2(tgx * TILE_SIZE, tgy * TILE_SIZE)
			is_moving = true

func can_move_to(gx: int, gy: int) -> bool:
	if gx < 0 or gx >= MAP_W or gy < 0 or gy >= MAP_H:
		return false
	return not collision_grid[gy][gx]

func on_step_completed() -> void:
	# 1. ボスチェック
	var boss_id: String = boss_event_grid[player_gy][player_gx]
	if boss_id != "" and not GameState.boss_defeated.get(boss_id, false):
		trigger_boss_battle(boss_id)
		return
		
	# 2. ランダムエンカウント
	var enc_type: String = encounter_grid[player_gy][player_gx]
	if enc_type != "":
		steps_since_encounter += 1
		if steps_since_encounter >= 8:
			var roll := randf()
			if roll < 0.12 or steps_since_encounter >= 25:
				steps_since_encounter = 0
				trigger_random_battle(enc_type)

func trigger_boss_battle(boss_id: String) -> void:
	GameState.player_pos["grid_x"] = player_gx
	GameState.player_pos["grid_y"] = player_gy
	GameState.player_pos["facing"] = player_facing
	AudioManager.play_se("se_encounter")
	SceneManager.start_battle([boss_id], "shrine", true)

func trigger_random_battle(enc_type: String) -> void:
	GameState.player_pos["grid_x"] = player_gx
	GameState.player_pos["grid_y"] = player_gy
	GameState.player_pos["facing"] = player_facing
	AudioManager.play_se("se_encounter")
	var enemy_ids := ["karakasa", "chochin"]
	if enc_type == "forest":
		enemy_ids = ["hitotsume", "bakegitsune"]
	elif enc_type == "snow_mountain":
		enemy_ids = ["hyouro", "yukionna_mob"]
	SceneManager.start_battle(enemy_ids, "forest", false)

func _unhandled_input(event: InputEvent) -> void:
	if dialog_box and dialog_box.visible:
		dialog_box.handle_custom_input(event)
		return
		
	if item_window and item_window.visible:
		item_window.handle_custom_input(event)
		return
		
	if status_window and status_window.visible:
		status_window.handle_custom_input(event)
		return
		
	if menu_window and menu_window.visible:
		menu_window.handle_custom_input(event)
		return
		
	if event.is_action_pressed("confirm") or event.is_action_pressed("ui_accept"):
		try_interact()
	elif event.is_action_pressed("cancel"):
		AudioManager.play_se("se_select")
		menu_window.open()

func try_interact() -> void:
	var fx := 0
	var fy := 0
	match player_facing:
		"up": fy = -1
		"down": fy = 1
		"left": fx = -1
		"right": fx = 1
		
	var tx := player_gx + fx
	var ty := player_gy + fy
	
	if tx < 0 or tx >= MAP_W or ty < 0 or ty >= MAP_H:
		return
		
	# 白鷺神社 賽銭箱 / 神鏡判定（HP/MP全快 + セーブ）
	var is_shrine: bool = (map_grid[ty][tx] == "shrine_box")
	if (current_chapter == 1 and tx == 36 and ty == 5) or (current_chapter == 2 and tx == 25 and ty == 12) or (current_chapter == 3 and tx == 20 and ty == 12):
		is_shrine = true
		
	if is_shrine:
		for p in GameState.party:
			p["hp"] = p["maxHp"]
			p["mp"] = p["maxMp"]
		AudioManager.play_se("se_heal")
		GameState.player_pos["grid_x"] = player_gx
		GameState.player_pos["grid_y"] = player_gy
		GameState.player_pos["facing"] = player_facing
		SaveManager.save_game()
		dialog_box.start_dialog("白鷺神社の神鏡", ["神鏡に手を合わせ、千歳杉の神気に祈りを捧げた……。\n【 パーティ全員のHP・MPが全快した！ 】\n【 冒険の旅路を記録した！（セーブ完了） 】"], "")
		return
		
	# NPC判定
	for n in npcs:
		if n.get("x") == tx and n.get("y") == ty:
			interact_with_npc(n)
			return

func interact_with_npc(npc: Dictionary) -> void:
	var msgs: Array[String] = []
	for m in npc.get("messages", npc.get("dialog", [])):
		msgs.append(str(m))
	var p_key: String = npc.get("portraitKey", npc.get("spriteKey", ""))
	
	# 宿屋・回復NPCなら回復
	if npc.get("healParty", false) or npc.get("isHealer", false):
		for p in GameState.party:
			p["hp"] = p["maxHp"]
			p["mp"] = p["maxMp"]
		AudioManager.play_se("se_heal")
		
	dialog_box.start_dialog(npc.get("name", "村人"), msgs, p_key)

func _on_dialog_finished() -> void:
	pass

func _on_status_requested() -> void:
	status_window.open()

func _on_item_requested() -> void:
	item_window.open(false)

func _on_chapter_move_requested(ch: int) -> void:
	SceneManager.change_scene("MAP", {"chapter_num": ch}, 0.5)

func _on_save_requested() -> void:
	GameState.player_pos["grid_x"] = player_gx
	GameState.player_pos["grid_y"] = player_gy
	GameState.player_pos["facing"] = player_facing
	if SaveManager.save_game():
		AudioManager.play_se("se_select")
		dialog_box.start_dialog("記録の巻物", ["冒険の旅路を記録した。（セーブ完了）"], "")

func update_camera() -> void:
	var half_w := 1280.0 / 2.0
	var half_h := 960.0 / 2.0
	var max_x := MAP_W * TILE_SIZE - half_w
	var max_y := MAP_H * TILE_SIZE - half_h
	var cx := clampf(player_pos.x + 32.0, half_w, max_x)
	var cy := clampf(player_pos.y + 32.0, half_h, max_y)
	camera.position = Vector2(cx, cy)

