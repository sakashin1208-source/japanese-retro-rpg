extends Node

## 『妖幻奇譚 〜もののけ草子〜』オーディオマネージャ (AudioManager)

var bgm_player: AudioStreamPlayer
var se_players: Array[AudioStreamPlayer] = []
const SE_POOL_SIZE := 8

var bgm_streams: Dictionary = {}
var se_streams: Dictionary = {}

var is_muted: bool = false
var current_bgm_name: String = ""

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	bgm_player = AudioStreamPlayer.new()
	bgm_player.bus = "Master"
	add_child(bgm_player)
	
	for i in range(SE_POOL_SIZE):
		var p := AudioStreamPlayer.new()
		p.bus = "Master"
		add_child(p)
		se_players.append(p)
		
	load_audio_assets()

func load_audio_assets() -> void:
	var bgms := ["bgm_opening", "bgm_village", "bgm_battle", "bgm_title"]
	for b in bgms:
		var p := "res://assets/audio/bgm/%s.wav" % b
		if ResourceLoader.exists(p):
			var s: AudioStream = load(p)
			if s is AudioStreamWAV:
				s.loop_mode = AudioStreamWAV.LOOP_FORWARD
			bgm_streams[b] = s
			
	var ses := [
		"se_select", "se_cancel", "se_cursor", "se_hit",
		"se_slash", "se_magic", "se_heal", "se_enemy_dead",
		"se_encounter", "se_victory"
	]
	for s in ses:
		var p := "res://assets/audio/se/%s.wav" % s
		if ResourceLoader.exists(p):
			se_streams[s] = load(p)

func play_bgm(bgm_name: String) -> void:
	if current_bgm_name == bgm_name and bgm_player.playing:
		return
		
	current_bgm_name = bgm_name
	if not bgm_streams.has(bgm_name):
		return
		
	bgm_player.stream = bgm_streams[bgm_name]
	if not is_muted:
		bgm_player.play()

func stop_bgm() -> void:
	current_bgm_name = ""
	bgm_player.stop()

func play_se(se_name: String) -> void:
	if is_muted or not se_streams.has(se_name):
		return
		
	var stream: AudioStream = se_streams[se_name]
	# 空いているSEプレイヤーを探す
	for p in se_players:
		if not p.playing:
			p.stream = stream
			p.play()
			return
			
	# 空きがなければ先頭を再利用
	se_players[0].stream = stream
	se_players[0].play()

func toggle_mute() -> bool:
	is_muted = not is_muted
	if is_muted:
		bgm_player.stop()
	elif current_bgm_name != "":
		play_bgm(current_bgm_name)
	return is_muted
