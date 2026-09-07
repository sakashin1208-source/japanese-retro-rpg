extends Node2D

## オープニングシーン (OpeningScene)
## 四幕シネマティック（赤き月、九尾の目覚め、三人の英傑、タイトルドロップ）

var timer: float = 0.0
var current_act: int = 0
var is_skipped: bool = false

const ACT_DURATIONS := [5.0, 5.5, 5.5, 5.0]

var act_labels: Array[String] = [
	"第一幕：禍月降臨\n千年の封印破れ、深紅の月が天を染めるとき……",
	"第二幕：妖狐の目覚め\n九尾の妖狐・茜、古の怨嗟を纏いて現世に甦る。",
	"第三幕：立ち向かう三人の英傑\n若武者・疾風、白鷺神子・小夜、月影忍・朧が立ち上がる！",
	"第四幕：妖幻奇譚 〜もののけ草子〜\n神木千歳杉の神気を宿す三神具を奪還せよ！"
]

@onready var bg_color_rect: ColorRect = $BGColorRect
@onready var text_label: Label = $TextLabel
@onready var skip_label: Label = $SkipLabel
@onready var sprite_container: Control = $SpriteContainer

func _ready() -> void:
	AudioManager.play_bgm("bgm_opening")
	update_act_display()

func _process(delta: float) -> void:
	if is_skipped:
		return
		
	timer += delta
	var acc := 0.0
	for i in range(ACT_DURATIONS.size()):
		acc += ACT_DURATIONS[i]
		if timer < acc:
			if current_act != i:
				current_act = i
				update_act_display()
			return
			
	finish()

func update_act_display() -> void:
	text_label.text = act_labels[current_act]
	
	# スプライト演出の更新
	for c in sprite_container.get_children():
		c.queue_free()
		
	if current_act == 1:
		# 九尾スプライト
		var tex_path := "res://assets/sprites/youko_battle_idle.png"
		if ResourceLoader.exists(tex_path):
			var tr := TextureRect.new()
			tr.texture = load(tex_path)
			tr.position = Vector2(1280 / 2 - 64, 960 / 2 - 100)
			tr.size = Vector2(128, 128)
			sprite_container.add_child(tr)
	elif current_act == 2:
		# 三人のスプライト
		var heroes := ["samurai_battle_idle", "miko_battle_idle", "ninja_battle_idle"]
		for i in range(heroes.size()):
			var tex_path := "res://assets/sprites/%s.png" % heroes[i]
			if ResourceLoader.exists(tex_path):
				var tr := TextureRect.new()
				tr.texture = load(tex_path)
				tr.position = Vector2(400 + i * 180, 960 / 2 - 80)
				tr.size = Vector2(128, 128)
				sprite_container.add_child(tr)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("confirm") or event.is_action_pressed("cancel") or (event is InputEventMouseButton and event.pressed):
		skip()

func skip() -> void:
	if is_skipped:
		return
	is_skipped = true
	AudioManager.play_se("se_select")
	finish()

func finish() -> void:
	SceneManager.change_scene("TITLE", {}, 0.4)
