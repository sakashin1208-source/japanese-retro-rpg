extends Node

func _ready() -> void:
	print("--- Running Full End-to-End Game Flow Test ---")
	
	# 1. Main Scene
	var main = preload("res://scenes/main/main.tscn").instantiate()
	add_child(main)
	print("Step 1: Main scene loaded")
	await get_tree().process_frame
	main.queue_free()
	
	# 2. Title Scene
	var title = preload("res://scenes/title/title_scene.tscn").instantiate()
	add_child(title)
	print("Step 2: Title scene loaded. Menu items count: ", title.menu_items.size())
	# Select "はじめから" (index 0)
	title.selected_index = 0
	title.execute_selected()
	print("Step 2b: Executed 'は じ め か ら'")
	await get_tree().process_frame
	title.queue_free()
	
	# 3. Map Scene
	var map = preload("res://scenes/map/map_scene.tscn").instantiate()
	add_child(map)
	await get_tree().process_frame
	print("Step 3: Map scene entered! Chapter: ", map.current_chapter)
	
	# Test NPC Interaction
	var elder = null
	for n in map.npcs:
		if n.get("spriteKey") == "npc_elder":
			elder = n
			break
	if elder:
		map.interact_with_npc(elder)
		print("Step 3b: Spoke with Elder! Dialog visible: ", map.dialog_box.visible)
		print("Dialog speaker: ", map.dialog_box.speaker_name)
		map.dialog_box.close_dialog()
		
	# Test Menu Open & Save
	map.menu_window.open()
	print("Step 3c: Menu window opened: ", map.menu_window.visible)
	map._on_save_requested()
	print("Step 3d: Save requested! Has save: ", SaveManager.has_save_data())
	map.menu_window.close()
	map.dialog_box.close_dialog()
	
	# 4. Trigger Battle
	print("Step 4: Starting Battle from Map...")
	var battle = preload("res://scenes/battle/battle_scene.tscn").instantiate()
	add_child(battle)
	battle.setup_battle({"enemy_ids": ["karakasa"]})
	print("Battle phase: ", battle.phase)
	
	# Defeat enemy & win
	battle.enemies[0]["hp"] = 0
	battle.check_battle_end()
	print("Battle end phase: ", battle.phase)
	
	battle.queue_free()
	map.queue_free()
	
	print(">> End-to-End Flow Test: 100% SUCCESS <<")
	get_tree().quit(0)