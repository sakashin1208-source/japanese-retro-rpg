extends Node2D

func _ready() -> void:
	var path = "res://assets/sprites/samurai_walk_down_0.png"
	var tex = load(path)
	draw.connect(func():
		draw_circle(Vector2(32, 32), 16, Color(0, 0, 0, 0.4))
		draw_texture(tex, Vector2(64, 64))
	)
	queue_redraw()
	await get_tree().process_frame
	print("Drawn without error")
	get_tree().quit(0)