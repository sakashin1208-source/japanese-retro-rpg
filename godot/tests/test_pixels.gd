extends Node

func _ready() -> void:
	var path = "res://assets/sprites/samurai_walk_down_0.png"
	var tex = load(path)
	var img = tex.get_image()
	print("Image size: ", img.get_size())
	for y in range(0, 64, 8):
		var line = ""
		for x in range(0, 64, 4):
			var col = img.get_pixel(x, y)
			if col.a == 0:
				line += "."
			elif col.r > 0.9 and col.g > 0.9 and col.b > 0.9:
				line += "W"
			else:
				line += "#"
		print(line)
	get_tree().quit(0)