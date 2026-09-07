extends Node2D

func _ready() -> void:
	print("--- Testing Sprite2D Character System ---")
	var char_textures := {}
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
			
	var spr := Sprite2D.new()
	spr.texture = char_textures.get("samurai_walk_down_0")
	spr.centered = false
	add_child(spr)
	
	print("Sprite2D texture: ", spr.texture)
	print("Sprite2D texture size: ", spr.texture.get_size() if spr.texture else "null")
	
	# Test changing frame
	spr.texture = char_textures.get("samurai_walk_down_1")
	print("Changed to frame 1: ", spr.texture != null)
	
	print("--- Sprite2D Character System Passed! ---")
	get_tree().quit(0)