extends Node2D

@onready var map = $MapScene

func _ready() -> void:
	var vp = get_viewport()
	
	# Simulate moving right 2 tiles
	for i in range(35):
		map.player_facing = "right"
		if not map.is_moving:
			map.player_target_pos = map.player_pos + Vector2(64, 0)
			map.is_moving = true
		map._process(0.033)
		await get_tree().process_frame
		
	await get_tree().process_frame
	await get_tree().process_frame
	
	var img = vp.get_texture().get_image()
	if img:
		img.save_png("C:/dev/japanese-retro-rpg/test_render_party.png")
		print("Saved party screenshot to C:/dev/japanese-retro-rpg/test_render_party.png")
	get_tree().quit(0)