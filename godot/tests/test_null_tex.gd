extends Node2D

func _ready() -> void:
	draw.connect(func():
		print("Testing draw_texture with null...")
		draw_texture(null, Vector2.ZERO)
	)
	queue_redraw()
	await get_tree().process_frame
	get_tree().quit(0)