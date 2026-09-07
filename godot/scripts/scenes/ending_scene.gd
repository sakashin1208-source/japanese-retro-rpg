extends Node2D

## エンディングシーン (EndingScene)
## 大団円スタッフロール、茜の浄化、朝焼けの空

var scroll_y: float = 960.0
var scroll_speed: float = 40.0
var is_finished: bool = false

var credits: Array[String] = [
	"【 妖 幻 奇 譚 〜もののけ草子〜 】",
	"",
	"〜 企画・監督 〜",
	"しんちゃん",
	"",
	"〜 キャラクター 〜",
	"風神無想流 侍「疾風」",
	"白鷺神社 神子「小夜」",
	"月影忍軍 頭領「朧」",
	"",
	"〜 音響・劇伴 〜",
	"和風都節シンセ音源 (Godot 4 HD-2D版)",
	"",
	"〜 登場妖怪 〜",
	"もののけ全五十種 ＆ 九大妖魔将",
	"",
	"〜 特別出演 〜",
	"大妖狐・茜 ＆ 神楽の里の人々",
	"",
	"人の心に優しさがある限り、",
	"もののけと人は共に生きていける——",
	"",
	"【 終 幕（完） 】",
	"ご遊戯いただき、ありがとうございました！"
]

@onready var credits_container: VBoxContainer = $CreditsContainer

func _ready() -> void:
	AudioManager.play_bgm("bgm_village")
	for line in credits:
		var lbl := Label.new()
		lbl.text = line
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.add_theme_font_size_override("font_size", 32)
		lbl.add_theme_color_override("font_color", Color(1, 0.95, 0.8))
		credits_container.add_child(lbl)
	credits_container.position.y = 960

func _process(delta: float) -> void:
	if is_finished:
		return
	credits_container.position.y -= scroll_speed * delta
	if credits_container.position.y < -1200:
		finish()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("confirm") or event.is_action_pressed("cancel"):
		finish()

func finish() -> void:
	if is_finished:
		return
	is_finished = true
	AudioManager.play_se("se_select")
	SceneManager.change_scene("TITLE", {}, 0.8)
