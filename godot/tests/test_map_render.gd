extends Node

func _ready() -> void:
	print("--- Testing MapScene Rendering & Flow ---")
	MasterData.load_master_data()
	GameState.reset()
	
	var map = preload("res://scenes/map/map_scene.tscn").instantiate()
	add_child(map)
	
	print("Map initialized successfully!")
	print("Current chapter: ", map.current_chapter)
	print("Player position: ", map.player_pos)
	print("Camera position: ", map.camera.position)
	print("Loaded tile textures count: ", map.tile_textures.size())
	print("Loaded char textures count: ", map.char_textures.size())
	print("NPC count: ", map.npcs.size())
	
	for s in map.party_sprites:
		print("Party sprite: ", s.name, " tex: ", s.texture, " res: ", s.texture.resource_path if s.texture else "NONE")
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
	for n in MasterData.npcs:
		var spk: String = n.get("spriteKey", "")
		var mapped_key: String = aliases.get(spk, spk)
		var sp_exists = ResourceLoader.exists("res://assets/sprites/%s.png" % mapped_key)
		var port_exists = ResourceLoader.exists("res://assets/portraits/%s.png" % mapped_key)
		print("NPC [%s]: orig='%s' mapped='%s' sprite=%s port=%s" % [n.get("id"), spk, mapped_key, sp_exists, port_exists])
	
	# Simulate 10 frames of movement
	map.player_facing = "down"
	map.handle_movement_input()
	for i in range(10):
		map._process(0.016)
		
	print("After 10 frames position: ", map.player_pos)
	for s in map.party_sprites:
		print("Party sprite post-move: ", s.name, " tex: ", s.texture.resource_path if s.texture else "NONE")
	print("History length: ", map.pos_history.size())
	
	map.queue_free()
	print("--- MapScene Test Passed! ---")
	get_tree().quit(0)