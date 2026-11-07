# -*- coding: utf-8 -*-
"""說說島｜預錄語音產生器（可在 Stacy 的電腦執行；雲端要先在 claude.ai 允許網域加 speech.platform.bing.com，程式會自動走環境的 HTTPS_PROXY）。
讀 items.json → 用微軟台灣語音（edge-tts）合成 mp3 → 存到 audio/sp/ → 更新 audio/manifest.js。
用法：雙擊 start.bat，或  python gen_audio.py [--voice 曉臻] [--rate -5] [--pitch 0] [--force] [--only q] [--limit 50] [--workers 5]
"""
import argparse, asyncio, datetime, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
# 放在 repo 的 tools/tts/ 裡就寫進 repo 根目錄；單獨一包（zip）時寫在這個資料夾旁邊
ROOT = os.path.abspath(os.path.join(HERE, "..", "..")) if os.path.exists(os.path.join(HERE, "..", "..", "index.html")) else HERE
VOICES = {"曉臻": "zh-TW-HsiaoChenNeural", "曉雨": "zh-TW-HsiaoYuNeural", "雲哲": "zh-TW-YunJheNeural"}


async def synth(text, voice, rate, pitch, out):
    import edge_tts
    px = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")  # 雲端環境需走代理；PC 沒設就直連
    kw = {"proxy": px} if px else {}
    await edge_tts.Communicate(text, voice, rate="%+d%%" % rate, pitch="%+dHz" % pitch, **kw).save(out)


def write_manifest(items):
    have = {x["key"]: x["file"] for x in items if os.path.exists(os.path.join(ROOT, x["file"]))}
    os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
    # 格式要和 tools/tts/build_manifest.js 完全一樣（node tools/tts/build_manifest.js --check 會比對）
    with open(os.path.join(ROOT, "audio", "manifest.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("window.PREAUD=" + json.dumps(have, ensure_ascii=False, separators=(",", ":")) + ";\n")
    return len(have)


async def run(todo, voice, rate, pitch, force, workers, root):
    sem = asyncio.Semaphore(workers)
    stat = {"ok": 0, "skip": 0, "bad": 0, "n": 0}
    total = len(todo)

    async def one(x):
        path = os.path.join(root, x["file"])
        if os.path.exists(path) and not force:
            stat["skip"] += 1; return
        async with sem:
            for k in range(4):
                try:
                    await synth(x["speak"], voice, rate, pitch, path)
                    if os.path.getsize(path) < 500: raise RuntimeError("音檔太小，可能沒有合成成功")
                    stat["ok"] += 1; stat["n"] += 1
                    if stat["n"] % 50 == 0: print("  已完成 %d / %d" % (stat["n"], total), flush=True)
                    return
                except Exception as e:
                    if os.path.exists(path): os.remove(path)
                    if k == 3: print("  失敗：%s  (%s)" % (x["speak"][:30], str(e)[:80]), flush=True)
                    await asyncio.sleep(1.5 * (k + 1))
            stat["bad"] += 1

    await asyncio.gather(*[one(x) for x in todo])
    return stat


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="曉臻", help="曉臻／曉雨／雲哲，或完整聲音代號（預設曉臻）")
    ap.add_argument("--rate", type=int, default=-5, help="語速 %%，負的比較慢（預設 -5，給小朋友聽稍慢一點）")
    ap.add_argument("--pitch", type=int, default=0, help="音調 Hz（預設 0）")
    ap.add_argument("--force", action="store_true", help="已經有的音檔也重新產生")
    ap.add_argument("--only", help="只產某一關（例如 q、zb、sp；關卡代號見 items.json 的 cat）")
    ap.add_argument("--limit", type=int, help="最多產幾句（測試用）")
    ap.add_argument("--workers", type=int, default=5, help="同時合成幾句（預設 5；網路不穩就調小）")
    a = ap.parse_args()
    voice = VOICES.get(a.voice, a.voice)

    items = json.load(open(os.path.join(HERE, "items.json"), encoding="utf-8"))
    todo = [x for x in items if (a.only is None or x["cat"] == a.only)]
    if a.limit:
        todo = [x for x in todo if force_missing(x, a.force)][: a.limit]
    os.makedirs(os.path.join(ROOT, "audio", "sp"), exist_ok=True)
    print("共 %d 句要檢查（同時 %d 句）" % (len(todo), a.workers), flush=True)
    st = asyncio.run(run(todo, voice, a.rate, a.pitch, a.force, a.workers, ROOT))
    if st["ok"]:
        with open(os.path.join(ROOT, "audio", "sp", "_voice.txt"), "w", encoding="utf-8") as f:
            f.write("voice=%s rate=%+d%% pitch=%+dHz date=%s\n" % (voice, a.rate, a.pitch, datetime.date.today()))
    n = write_manifest(items)
    print("\n完成：新產生 %d、略過（已有）%d、失敗 %d。audio/manifest.js 目前有 %d 句。" % (st["ok"], st["skip"], st["bad"], n))
    print("音檔在：" + os.path.join(ROOT, "audio", "sp"))
    sys.exit(1 if st["bad"] else 0)


def force_missing(x, force):
    return force or not os.path.exists(os.path.join(ROOT, x["file"]))


if __name__ == "__main__":
    main()
