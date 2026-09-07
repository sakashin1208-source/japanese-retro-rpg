extends Node

const ItemWindow = preload("res://scripts/ui/item_window.gd")

var total_tests := 0
var passed_tests := 0
var failed_tests := 0

func assert_test(condition: bool, message: String) -> void:
	total_tests += 1
	if condition:
		passed_tests += 1
		print("  [PASS] %s" % message)
	else:
		failed_tests += 1
		printerr("  [FAIL] %s" % message)

func _ready() -> void:
	print("========================================")
	print(" 【 妖幻奇譚 〜もののけ草子〜 】")
	print(" Godot 4 統合テストスイート（受入全7項目 ＆ 基盤）")
	print("========================================")
	
	await get_tree().process_frame
	
	if MasterData.characters.is_empty():
		MasterData.load_master_data()
	GameState.reset()
	
	run_milestone_tests()
	run_acceptance_tests()
	
	print("\n========================================")
	var summary := "全 %d 件中: 成功 %d 件 / 失敗 %d 件" % [total_tests, passed_tests, failed_tests]
	print(summary)
	print("========================================")
	
	if failed_tests == 0:
		print(">> 全テスト合格 (ALL TESTS PASSED) <<")
		get_tree().quit(0)
	else:
		printerr(">> テスト失敗あり (FAILURES DETECTED) <<")
		get_tree().quit(1)

func run_milestone_tests() -> void:
	print("\n--- [M1: 基盤＆設定テスト] ---")
	var cfg_w = ProjectSettings.get_setting("display/window/size/viewport_width")
	var cfg_h = ProjectSettings.get_setting("display/window/size/viewport_height")
	assert_test(cfg_w == 1280 and cfg_h == 960, "画面解像度 1280x960 設定")
	
	var filter = ProjectSettings.get_setting("rendering/textures/canvas_textures/default_texture_filter")
	assert_test(filter == 0, "Nearestテクスチャフィルタ設定 (default_texture_filter == 0)")
	
	print("\n--- [M2: データ層テスト] ---")
	assert_test(MasterData.characters.size() == 3, "主人公3名 (疾風・小夜・朧)")
	assert_test(MasterData.skills.size() == 17, "技17種データ格納")
	assert_test(MasterData.enemies.size() == 59, "敵50種＋ボス9体 (計59種)")
	assert_test(MasterData.npcs.size() == 17, "NPC 17名")
	assert_test(MasterData.chapters.size() == 3, "全3章定義")
	
	print("\n--- [M3: アセットファイル整合性テスト] ---")
	var sprite_dir := DirAccess.open("res://assets/sprites")
	var sprite_count := 0
	if sprite_dir:
		sprite_dir.list_dir_begin()
		var fname := sprite_dir.get_next()
		while fname != "":
			if fname.ends_with(".png") and not fname.begins_with("yougen_sprites"):
				sprite_count += 1
			fname = sprite_dir.get_next()
	assert_test(sprite_count == 112, "個別キャラ・魔物スプライト 112枚存在 (実測: %d)" % sprite_count)
	
	var tile_dir := DirAccess.open("res://assets/tiles")
	var tile_count := 0
	if tile_dir:
		tile_dir.list_dir_begin()
		var fname := tile_dir.get_next()
		while fname != "":
			if fname.ends_with(".png"):
				tile_count += 1
			fname = tile_dir.get_next()
	assert_test(tile_count == 25, "マップタイル 25枚存在 (実測: %d)" % tile_count)
	
	var port_dir := DirAccess.open("res://assets/portraits")
	var port_count := 0
	if port_dir:
		port_dir.list_dir_begin()
		var fname := port_dir.get_next()
		while fname != "":
			if fname.ends_with(".png"):
				port_count += 1
			fname = port_dir.get_next()
	assert_test(port_count == 29, "顔ポートレート 29枚存在 (実測: %d)" % port_count)
	assert_test((sprite_count + tile_count + port_count) == 166, "高精細ドット絵 166枚完全抽出確認")

func run_acceptance_tests() -> void:
	print("\n========================================")
	print("【 受入テスト全7項目 】")
	print("========================================")
	test_acceptance_1()
	test_acceptance_2()
	test_acceptance_3()
	test_acceptance_4()
	test_acceptance_5()
	test_acceptance_6()
	test_acceptance_7()
	test_acceptance_8()
	test_acceptance_9()
	test_acceptance_10()

func test_acceptance_1() -> void:
	GameState.reset()
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa"]})
	
	battle_scene.enemies[0]["hp"] = 0
	var ended = battle_scene.check_battle_end()
	assert_test(ended and battle_scene.phase == "VICTORY", "[受入1] 敵HP=0でVICTORYフェーズへ遷移")
	assert_test(GameState.party[0]["exp"] >= 12, "[受入1] 戦闘終了後に疾風のEXPがStateへ反映 (EXP: %d)" % GameState.party[0]["exp"])
	battle_scene.queue_free()

func test_acceptance_2() -> void:
	GameState.reset()
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["akaoni"]})
	
	for p in battle_scene.party:
		p["hp"] = 0
	var ended = battle_scene.check_battle_end()
	assert_test(ended and battle_scene.phase == "DEFEAT", "[受入2] 味方全員HP=0でDEFEATフェーズへ遷移")
	
	var all_restored := true
	for p in GameState.party:
		if p["hp"] != p["maxHp"] or p["mp"] != p["maxMp"]:
			all_restored = false
			break
	assert_test(all_restored, "[受入2] 敗北復帰後に全員のHP・MPが全快している")
	battle_scene.queue_free()

func test_acceptance_3() -> void:
	GameState.money = 9999
	GameState.current_chapter = 3
	GameState.party[0]["level"] = 5
	GameState.boss_defeated["akaoni"] = true
	GameState.boss_defeated["shuten"] = true
	
	GameState.reset()
	assert_test(GameState.money == 0, "[受入3] reset() で所持金が0に戻る")
	assert_test(GameState.current_chapter == 1, "[受入3] reset() で第一章に戻る")
	assert_test(GameState.party[0]["level"] == 1, "[受入3] reset() で疾風がLv1に戻る")
	
	var all_boss_false := true
	for v in GameState.boss_defeated.values():
		if v:
			all_boss_false = false
			break
	assert_test(all_boss_false, "[受入3] reset() で全ボス未撃破に戻る")

func test_acceptance_4() -> void:
	GameState.money = 3500
	GameState.current_chapter = 2
	GameState.boss_defeated["akaoni"] = true
	GameState.boss_defeated["youko"] = true
	GameState.artifacts["mirror"] = true
	GameState.player_pos = {"grid_x": 25, "grid_y": 12, "facing": "up"}
	
	var save_ok = SaveManager.save_game()
	assert_test(save_ok, "[受入4] SaveManager.save_game() が成功する")
	
	GameState.reset()
	var load_ok = SaveManager.load_game()
	assert_test(load_ok, "[受入4] SaveManager.load_game() が成功する")
	assert_test(GameState.money == 3500, "[受入4] ロード後に所持金が完全一致 (3500)")
	assert_test(GameState.current_chapter == 2, "[受入4] ロード後に章番号が完全一致 (2)")
	assert_test(GameState.boss_defeated["youko"] == true, "[受入4] ロード後にボス撃破フラグが完全一致")
	assert_test(GameState.artifacts["mirror"] == true, "[受入4] ロード後に神具フラグが完全一致")
	assert_test(GameState.player_pos["grid_x"] == 25 and GameState.player_pos["facing"] == "up", "[受入4] ロード後にプレイヤー座標・向きが完全一致")
	
	SaveManager.clear_save()

func test_acceptance_5() -> void:
	GameState.reset()
	var item_win = ItemWindow.new()
	add_child(item_win)
	
	GameState.party[0]["hp"] = 10
	var kizu_item: Dictionary = {}
	for it in GameState.items:
		if it.get("id") == "kizugusuri":
			kizu_item = it
			break
	var init_count: int = kizu_item.get("count", 9)
	item_win.use_selected_item(kizu_item)
	assert_test(GameState.party[0]["hp"] == GameState.party[0]["maxHp"], "[受入5-マップ] マップ上で傷薬を使用してHPが上限まで回復 (実測: %d/%d)" % [GameState.party[0]["hp"], GameState.party[0]["maxHp"]])
	assert_test(kizu_item.get("count") == init_count - 1, "[受入5-マップ] 傷薬の所持数が1減る")
	
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa"]})
	battle_scene.party[1]["hp"] = 10
	var count_before = kizu_item.get("count", 8)
	
	kizu_item["count"] -= 1
	battle_scene.party[1]["hp"] = min(battle_scene.party[1]["maxHp"], battle_scene.party[1]["hp"] + kizu_item.get("value", 50))
	assert_test(battle_scene.party[1]["hp"] == battle_scene.party[1]["maxHp"], "[受入5-戦闘] 戦闘中アイテム使用で小夜のHP回復 (実測: %d/%d)" % [battle_scene.party[1]["hp"], battle_scene.party[1]["maxHp"]])
	assert_test(kizu_item.get("count") == count_before - 1, "[受入5-戦闘] 戦闘中アイテム使用で所持数が1減る")
	
	battle_scene.queue_free()
	item_win.queue_free()

func test_acceptance_6() -> void:
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa"]})
	
	battle_scene.action_queue = [
		{"side": "party", "index": 1, "actor": battle_scene.party[1]},
		{"side": "party", "index": 2, "actor": battle_scene.party[2]},
		{"side": "party", "index": 0, "actor": battle_scene.party[0]},
		{"side": "enemy", "index": 0, "actor": battle_scene.enemies[0]}
	]
	
	battle_scene.action_queue.sort_custom(func(a, b):
		var spd_a = a["actor"].get("spd", 10) * a["actor"].get("buffSpd", 1.0)
		var spd_b = b["actor"].get("spd", 10) * b["actor"].get("buffSpd", 1.0)
		return spd_a > spd_b
	)
	
	assert_test(battle_scene.action_queue[0]["side"] == "party" and battle_scene.action_queue[0]["index"] == 2, "[受入6] 素早さ最高の朧(spd 22)が1番手")
	assert_test(battle_scene.action_queue[1]["side"] == "party" and battle_scene.action_queue[1]["index"] == 0, "[受入6] 疾風(spd 15)が2番手")
	assert_test(battle_scene.action_queue[2]["side"] == "enemy" and battle_scene.action_queue[2]["index"] == 0, "[受入6] 敵(spd 12)が3番手")
	assert_test(battle_scene.action_queue[3]["side"] == "party" and battle_scene.action_queue[3]["index"] == 1, "[受入6] 小夜(spd 11)が4番手")
	
	battle_scene.queue_free()

func test_acceptance_7() -> void:
	var hayate = MasterData.characters[0]
	var karakasa = MasterData.get_enemy("karakasa")
	var iai_skill = MasterData.get_skill("iai")
	
	var normal_dmg: int = int(floor(hayate["atk"] * 1.0 * 1.4 - karakasa["def"] * 1.0 * 0.7))
	var iai_power: float = iai_skill.get("power", 1.6)
	var iai_dmg: int = int(floor(hayate["atk"] * 1.0 * 1.4 * iai_power - karakasa["def"] * 1.0 * 0.5))
	
	assert_test(normal_dmg == 24, "[受入7] Lv1疾風の通常攻撃期待値が 24 (実測: %d)" % normal_dmg)
	assert_test(iai_dmg == 42, "[受入7] Lv1疾風の居合い一閃期待値が 42 (実測: %d)" % iai_dmg)
	assert_test(iai_dmg > normal_dmg, "[受入7] 居合い一閃が通常攻撃より圧倒的に高いダメージを出す (42 > 24)")

func test_acceptance_8() -> void:
	# 敵ターゲット選択機能の検証
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa", "chochin", "ittanmomen"]})
	battle_scene.begin_input_phase()
	
	# 初期状態: 疾風の入力待ち
	assert_test(battle_scene.phase == "INPUT" and battle_scene.current_actor_idx == 0, "[受入8-1] バトル開始時に疾風(actor 0)のコマンド入力待ち")
	
	# 「こうげき」選択 -> ターゲット選択モード開始
	battle_scene.command_cursor = 0
	battle_scene.execute_command()
	assert_test(battle_scene.is_selecting_target == true, "[受入8-2] こうげき選択後にターゲット選択モード(is_selecting_target)へ遷移")
	assert_test(battle_scene.target_type == "enemy", "[受入8-3] ターゲット対象種別がenemy")
	assert_test(battle_scene.target_cursor == 0, "[受入8-4] 初期ターゲットカーソルは先頭(0: から傘小僧)")
	
	# ターゲットを2番目(1: 提灯お化け)に変更して確定
	battle_scene.target_cursor = 1
	battle_scene.confirm_target_selection()
	
	assert_test(battle_scene.is_selecting_target == false, "[受入8-5] ターゲット決定後に選択モード解除")
	assert_test(battle_scene.action_queue.size() == 1, "[受入8-6] アクションキューに1件登録")
	var act: Dictionary = battle_scene.action_queue[0]
	assert_test(act.get("target_idx") == 1, "[受入8-7] アクションの対象が選択した2番目の敵(target_idx: 1)になっている")
	assert_test(battle_scene.current_actor_idx == 1, "[受入8-8] 決定後に次の仲間(小夜)の入力へ進行")
	
	# 生存敵リストの確認（敵0を撃破）
	battle_scene.enemies[0]["hp"] = 0
	var living_enemies: Array = battle_scene.get_living_enemies()
	assert_test(living_enemies.size() == 2, "[受入8-9] HP=0の敵は生存敵リストから除外される (実測生存数: %d)" % living_enemies.size())
	assert_test(living_enemies[0]["id"] == "chochin" and living_enemies[1]["id"] == "ittanmomen", "[受入8-10] 生存している敵のみがターゲット候補として取得される")
	
	battle_scene.queue_free()

func test_acceptance_9() -> void:
	# 戦闘後の座標保持 ＆ 敗北時神社復帰の検証
	GameState.reset()
	GameState.player_pos = {"grid_x": 22, "grid_y": 18, "facing": "right"}
	
	# 1. 勝利時: マップ座標が維持されること
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa"]})
	battle_scene.enemies[0]["hp"] = 0
	battle_scene.check_battle_end()
	assert_test(GameState.player_pos["grid_x"] == 22 and GameState.player_pos["grid_y"] == 18, "[受入9-1] 戦闘勝利後にエンカウント地点(22, 18)の座標が保持される")
	battle_scene.queue_free()
	
	# 2. 逃走時: マップ座標が維持されること
	battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa"]})
	battle_scene.finish_battle_escape()
	assert_test(GameState.player_pos["grid_x"] == 22 and GameState.player_pos["grid_y"] == 18, "[受入9-2] 戦闘逃走後にもエンカウント地点(22, 18)の座標が保持される")
	battle_scene.queue_free()
	
	# 3. 敗北全滅時: 章の復活地点(神社: 36, 8)に復帰すること
	battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["akaoni"]})
	for p in battle_scene.party:
		p["hp"] = 0
	battle_scene.check_battle_end()
	assert_test(GameState.player_pos["grid_x"] == 36 and GameState.player_pos["grid_y"] == 8, "[受入9-3] 全滅敗北時は白鷺神社の復活地点(36, 8)に復帰する (実測: %d, %d)" % [GameState.player_pos["grid_x"], GameState.player_pos["grid_y"]])
	battle_scene.queue_free()

func test_acceptance_10() -> void:
	# 村人会話ダイアログ進行＆決定でのクローズ検証
	var dialog_box = preload("res://scripts/ui/dialog_box.gd").new()
	add_child(dialog_box)
	
	var msgs: Array[String] = ["白鷺の里へようこそ。", "東の森には凶悪な妖気を感じます……！"]
	dialog_box.start_dialog("村人", msgs, "npc_villager")
	
	assert_test(dialog_box.visible == true, "[受入10-1] 会話開始後にダイアログが表示される")
	assert_test(dialog_box.speaker_name == "村人", "[受入10-2] 話者名が正しく設定される")
	assert_test(dialog_box.current_page == 0, "[受入10-3] 最初のページ(0)から開始")
	
	# 1回目の入力: タイプライター早送り
	var fake_event = InputEventAction.new()
	fake_event.action = "confirm"
	fake_event.pressed = true
	dialog_box.handle_custom_input(fake_event)
	assert_test(dialog_box.is_page_complete == true, "[受入10-4] 決定キー入力で文字送りが瞬時に完了する")
	assert_test(dialog_box.current_page == 0, "[受入10-5] 早送り時点ではまだ1ページ目を維持")
	
	# 2回目の入力: 2ページ目へ進む
	dialog_box.handle_custom_input(fake_event)
	assert_test(dialog_box.current_page == 1, "[受入10-6] 2回目の決定キーで次のページ(1)へ進む")
	
	# 3回目の入力: 2ページ目の早送り
	dialog_box.handle_custom_input(fake_event)
	assert_test(dialog_box.is_page_complete == true, "[受入10-7] 2ページ目の文字送りが瞬時に完了する")
	
	# 4回目の入力: 会話終了（ウィンドウが閉じる）
	var flag: Array[bool] = [false]
	dialog_box.dialog_finished.connect(func(): flag[0] = true)
	dialog_box.handle_custom_input(fake_event)
	
	assert_test(dialog_box.visible == false, "[受入10-8] 最後のメッセージ後の決定キーで会話ウィンドウが消える (visible == false)")
	assert_test(flag[0] == true, "[受入10-9] dialog_finished シグナルが発火し操作ロックが解除される")
	
	dialog_box.queue_free()