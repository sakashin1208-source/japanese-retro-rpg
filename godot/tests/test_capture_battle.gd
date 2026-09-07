extends Node2D

func _ready() -> void:
	if MasterData.characters.is_empty():
		MasterData.load_master_data()
	GameState.reset()
	
	var battle_scene = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle_scene)
	battle_scene.setup_battle({"enemy_ids": ["karakasa", "chochin", "ittanmomen"]})
	battle_scene.begin_input_phase()
	
	# こうげきを選択
	battle_scene.command_cursor = 0
	battle_scene.execute_command()
	
	# 2番目の敵（提灯お化け）を選択
	battle_scene.target_cursor = 1
	battle_scene.refresh_target_ui()
	
	for i in range(15):
		await get_tree().process_frame
	
	var vp = get_viewport()
	var img = vp.get_texture().get_image()
	if img:
		var save_path = "res://tests/artifacts/battle_target_selection_verified.png"
		img.save_png(save_path)
		print("Saved battle target screenshot to: ", save_path)
	
	get_tree().quit(0)
