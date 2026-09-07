extends Node

func _ready() -> void:
	var path = "res://assets/sprites/samurai_walk_down_0.png"
	print("Exists: ", ResourceLoader.exists(path))
	var tex = load(path)
	print("Tex: ", tex)
	print("Tex class: ", tex.get_class() if tex else "null")
	if tex is Texture2D:
		print("Size: ", tex.get_size())
		var img = tex.get_image()
		print("Image: ", img)
		print("Format: ", img.get_format() if img else "no img")
	get_tree().quit(0)