extends Node2D

func _ready() -> void:
	# 起動時はタイトル画面へ直行（「はじめから」「つづきから」「序幕」「終幕」が選択可能）
	SceneManager.change_scene("TITLE", {}, 0.1)
