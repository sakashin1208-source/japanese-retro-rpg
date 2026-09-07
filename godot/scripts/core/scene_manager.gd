extends CanvasLayer

## 『妖幻奇譚 〜もののけ草子〜』シーンマネージャ (SceneManager)

signal transition_finished

var color_rect: ColorRect

const SCENES := {
	"OPENING": "res://scenes/opening/opening_scene.tscn",
	"TITLE": "res://scenes/title/title_scene.tscn",
	"MAP": "res://scenes/map/map_scene.tscn",
	"BATTLE": "res://scenes/battle/battle_scene.tscn",
	"ENDING": "res://scenes/ending/ending_scene.tscn"
}

var current_scene_key: String = ""
var is_transitioning: bool = false
var battle_params: Dictionary = {}

func _ready() -> void:
	layer = 100 # 最前面
	if not color_rect:
		color_rect = ColorRect.new()
		color_rect.name = "ColorRect"
		color_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		color_rect.color = Color(0, 0, 0, 0)
		color_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(color_rect)

func change_scene(scene_key: String, params: Dictionary = {}, fade_duration: float = 0.35) -> void:
	if is_transitioning or not SCENES.has(scene_key):
		return
		
	is_transitioning = true
	battle_params = params
	current_scene_key = scene_key
	
	# フェードアウト (黒へ)
	var tween := create_tween()
	tween.tween_property(color_rect, "color", Color(0, 0, 0, 1), fade_duration)
	await tween.finished
	
	# シーン切り替え
	get_tree().change_scene_to_file(SCENES[scene_key])
	
	# フェードイン (透明へ)
	var tween_in := create_tween()
	tween_in.tween_property(color_rect, "color", Color(0, 0, 0, 0), fade_duration)
	await tween_in.finished
	
	is_transitioning = false
	transition_finished.emit()

func start_battle(enemy_ids: Array, bg_type: String = "forest", is_boss: bool = false) -> void:
	change_scene("BATTLE", {
		"enemy_ids": enemy_ids,
		"bg_type": bg_type,
		"is_boss": is_boss
	}, 0.25)
