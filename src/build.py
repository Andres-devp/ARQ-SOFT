import base64, re, pathlib
R = pathlib.Path(__file__).parent
css = (R/'styles.css').read_text()
body = ''.join((R/f'body{i}.html').read_text() for i in range(1, 6))
def img(m):
    p = R/'img'/m.group(1)
    mime = 'image/png' if p.suffix == '.png' else 'image/jpeg'
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode()
body = re.sub(r'\{\{IMG:([^}]+)\}\}', img, body)
js = '\n'.join((R/f).read_text() for f in ['data-gloss.js','data-ids.js','data-diag.js','data-more.js','data-quiz.js','sims.js','app.js'])
js = js.replace('</script', '<\\/script')
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">'
title = '<title>Parcial Arquitectura 4+1</title>'
frag = f'{title}\n{fonts}\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n'
out = R.parent
full = f'<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{title}\n{fonts}\n<style>\n{css}\n</style>\n</head>\n<body>\n{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n'
(out/'index.html').write_text(full)
print('index.html generado:', len(full)//1024, 'KB')
