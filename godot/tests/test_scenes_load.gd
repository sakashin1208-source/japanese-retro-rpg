extends SceneTree

func _init() -> void:
	print("--- Testing Scene Transitions ---")
	
	# 1. Load Main
	var main_res = load("res://scenes/main/main.tscn")
	print("Main Scene loaded: ", main_res != null)
	
	# 2. Load Title
	var title_res = load("res://scenes/title/title_scene.tscn")
	print("Title Scene loaded: ", title_res != null)
	
	# 3. Load Map
	var map_res = load("res://scenes/map/map_scene.tscn")
	print("Map Scene loaded: ", map_res != null)
	
	# 4. Instantiate Map
	var map = map_res.instantiate()
	print("Map instantiated: ", map != null)
	
	quit(0)