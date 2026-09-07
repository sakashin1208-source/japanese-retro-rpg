extends Node

func _ready() -> void:
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
	print("Successfully preloaded character textures count: ", char_textures.size())
	print("Has samurai_walk_down_0: ", char_textures.has("samurai_walk_down_0"))
	print("Has npc_elder: ", char_textures.has("npc_elder"))
	get_tree().quit(0)