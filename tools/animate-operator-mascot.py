"""Build the illustrated mascot's Blender mesh rig and seamless reading loop."""

import math
import os
from pathlib import Path

import bpy
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get('BILLER_MASCOT_OUTPUT', str(ROOT / 'output/mascot')))
scene = bpy.data.scenes.new('Biller chibi animation')
bpy.context.window.scene = scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 384
scene.render.resolution_y = 576
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 96
scene.render.filepath = str(OUTPUT / 'frame-')
scene.view_settings.view_transform = 'Standard'

image = bpy.data.images.load(str(ROOT / 'public/brand/biller-operator-mascot-chibi.png'), check_existing=True)
material = bpy.data.materials.new('Chibi original colors and transparency')
material.use_nodes = True
nodes = material.node_tree.nodes
nodes.clear()
texture = nodes.new('ShaderNodeTexImage')
texture.image = image
emission = nodes.new('ShaderNodeEmission')
transparent = nodes.new('ShaderNodeBsdfTransparent')
mix = nodes.new('ShaderNodeMixShader')
output = nodes.new('ShaderNodeOutputMaterial')
links = material.node_tree.links
links.new(texture.outputs['Color'], emission.inputs['Color'])
links.new(texture.outputs['Alpha'], mix.inputs[0])
links.new(transparent.outputs[0], mix.inputs[1])
links.new(emission.outputs[0], mix.inputs[2])
links.new(mix.outputs[0], output.inputs['Surface'])

columns, rows = 160, 240
vertices = [((x / columns - 0.5) * 2, (y / rows - 0.5) * 3, 0)
            for y in range(rows + 1) for x in range(columns + 1)]
faces = []
for y in range(rows):
    for x in range(columns):
        i = y * (columns + 1) + x
        faces.append((i, i + 1, i + columns + 2, i + columns + 1))
mesh = bpy.data.meshes.new('Illustration deformation grid')
mesh.from_pydata(vertices, [], faces)
mesh.update()
uv = mesh.uv_layers.new(name='Original illustration UV')
for polygon in mesh.polygons:
    for loop_index in polygon.loop_indices:
        x, y, _ = vertices[mesh.loops[loop_index].vertex_index]
        uv.data[loop_index].uv = ((x + 1) / 2, (y + 1.5) / 3)
mascot = bpy.data.objects.new('Chibi operator animated illustration', mesh)
scene.collection.objects.link(mascot)
mascot.data.materials.append(material)
mascot.shape_key_add(name='Original pose')


def smooth(a, b, value):
    t = max(0, min(1, (value - a) / (b - a)))
    return t * t * (3 - 2 * t)


head = mascot.shape_key_add(name='Head and ears tilt')
tail = mascot.shape_key_add(name='Tail sway')
breath = mascot.shape_key_add(name='Breathing and tablet reading')
for i, (x, y, z) in enumerate(vertices):
    head_weight = smooth(-0.12, 0.48, y)
    angle = 0.009 * head_weight
    head.data[i].co = (x * math.cos(angle) - (y - 0.02) * math.sin(angle),
                       0.02 + x * math.sin(angle) + (y - 0.02) * math.cos(angle), z)
    tail_weight = smooth(0.08, 0.45, x) * (1 - smooth(-0.45, -0.12, y))
    tail.data[i].co.x += 0.06 * tail_weight * smooth(-0.3, -1.15, y)
    body_weight = smooth(-1.2, -0.35, y)
    breath.data[i].co.y += 0.018 * body_weight

# Eyelids use a painted pose; no face vertices move during the blink.
closed_image = bpy.data.images.load(str(OUTPUT / 'chibi-closed-eyes.png'), check_existing=True)
clean_image = bpy.data.images.load(str(OUTPUT / 'chibi-hand-clean-plate.png'), check_existing=True)


def pixels(source):
    values = np.empty(1024 * 1536 * 4, dtype=np.float32)
    source.pixels.foreach_get(values)
    return values.reshape(1536, 1024, 4)[::-1].copy()


def packed_image(name, values):
    result = bpy.data.images.new(name, width=1024, height=1536, alpha=True)
    result.pixels.foreach_set(values[::-1].copy().ravel())
    result.pack()
    return result


original_pixels = pixels(image)
yy, xx = np.mgrid[:1536, :1024]
# Trace the original glove and fingertips, keeping the cuff on the body.
hand_outline = [(454, 877), (468, 881), (485, 894), (501, 909),
                (514, 930), (510, 949), (502, 964), (486, 974),
                (460, 972), (441, 961), (429, 951), (422, 940),
                (419, 929), (414, 922), (414, 916), (419, 909),
                (414, 904), (416, 896), (422, 890), (446, 891), (453, 892)]
inside = np.zeros((1536, 1024), dtype=bool)
for (ax, ay), (bx, by) in zip(hand_outline, hand_outline[1:] + hand_outline[:1]):
    if ay != by:
        inside ^= ((ay > yy) != (by > yy)) & (xx < (bx - ax) * (yy - ay) / (by - ay) + ax)
hand_pixels = original_pixels.copy()
hand_pixels[:, :, 3] *= inside
hand_image = packed_image('Isolated original hand', hand_pixels)
base_pixels = original_pixels.copy()
base_pixels[inside] = pixels(clean_image)[inside]
base_pixels[:, :, 3] = original_pixels[:, :, 3]
texture.image = packed_image('Body with hand removed', base_pixels)

closed_pixels = base_pixels.copy()
eye_mask = np.zeros((1536, 1024), dtype=np.float32)
for left, top, right, bottom in ((297, 604, 406, 711), (468, 574, 595, 686)):
    edge = np.minimum.reduce([xx - left, right - xx, yy - top, bottom - yy])
    eye_mask = np.maximum(eye_mask, np.clip(edge / 5, 0, 1))
closed_pixels[:, :, :3] = base_pixels[:, :, :3] * (1 - eye_mask[:, :, None]) + pixels(closed_image)[:, :, :3] * eye_mask[:, :, None]
closed_texture = nodes.new('ShaderNodeTexImage')
closed_texture.image = packed_image('Painted closed eyelids', closed_pixels)
color_mix = nodes.new('ShaderNodeMixRGB')
links.new(texture.outputs['Color'], color_mix.inputs[1])
links.new(closed_texture.outputs['Color'], color_mix.inputs[2])
links.new(color_mix.outputs[0], emission.inputs['Color'])
blink = color_mix.inputs[0]
for frame, value in ((1, 0), (38, 0), (40, 1), (41, 1), (44, 0), (97, 0)):
    blink.default_value = value
    blink.keyframe_insert(data_path='default_value', frame=frame)

# A separately painted pointing pose makes the fingertip readable at app size.
point_source = bpy.data.images.load(str(OUTPUT / 'chibi-pointing-hand.png'), check_existing=True)
point_outline = [(431, 843), (437, 842), (452, 853), (470, 868),
                 (479, 882), (493, 891), (505, 907), (516, 926),
                 (520, 943), (516, 958), (505, 966), (489, 967),
                 (475, 958), (465, 950), (455, 942), (442, 936),
                 (433, 930), (432, 923), (438, 918), (447, 918),
                 (443, 910), (445, 904), (455, 899), (463, 895),
                 (464, 885), (452, 873), (440, 862), (434, 853)]
point_mask = np.zeros((1536, 1024), dtype=bool)
for (ax, ay), (bx, by) in zip(point_outline, point_outline[1:] + point_outline[:1]):
    if ay != by:
        point_mask ^= ((ay > yy) != (by > yy)) & (xx < (bx - ax) * (yy - ay) / (by - ay) + ax)
point_pixels = pixels(point_source)
point_pixels[:, :, 3] = point_mask
point_image = packed_image('Painted pointing hand cutout', point_pixels)


def hand_layer(name, layer_image):
    layer_material = bpy.data.materials.new(name)
    layer_material.use_nodes = True
    ns = layer_material.node_tree.nodes
    ns.clear()
    tex = ns.new('ShaderNodeTexImage')
    tex.image = layer_image
    emit = ns.new('ShaderNodeEmission')
    transparent = ns.new('ShaderNodeBsdfTransparent')
    shader_mix = ns.new('ShaderNodeMixShader')
    alpha = ns.new('ShaderNodeMath')
    alpha.operation = 'MULTIPLY'
    alpha.inputs[1].default_value = 1
    out = ns.new('ShaderNodeOutputMaterial')
    ls = layer_material.node_tree.links
    ls.new(tex.outputs['Color'], emit.inputs['Color'])
    ls.new(tex.outputs['Alpha'], alpha.inputs[0])
    ls.new(alpha.outputs[0], shader_mix.inputs[0])
    ls.new(transparent.outputs[0], shader_mix.inputs[1])
    ls.new(emit.outputs[0], shader_mix.inputs[2])
    ls.new(shader_mix.outputs[0], out.inputs['Surface'])
    layer_mesh = mesh.copy()
    obj = bpy.data.objects.new(name, layer_mesh)
    scene.collection.objects.link(obj)
    obj.shape_key_clear()
    obj.data.materials.clear()
    obj.data.materials.append(layer_material)
    return obj, alpha.inputs[1]


rest_hand, rest_alpha = hand_layer('Resting grip hand', hand_image)
point_hand, point_alpha = hand_layer('Pointing hand - screen swipe', point_image)
for frame, value in ((1, 0), (12, 0), (17, 1), (45, 1), (50, 0), (97, 0)):
    point_alpha.default_value = value
    point_alpha.keyframe_insert(data_path='default_value', frame=frame)
    rest_alpha.default_value = 1 - value
    rest_alpha.keyframe_insert(data_path='default_value', frame=frame)

# A path parallel to the tablet edge, with a short contact pause before scrolling.
# The forearm follows the wrist while its elbow stays attached to the sleeve.
arm = mascot.shape_key_add(name='Forearm follows screen swipe')
for i, (x, y, z) in enumerate(vertices):
    px, py = (x + 1) * 512, (1.5 - y) * 512
    weight = smooth(491, 512, px) * (1 - smooth(536, 640, px))
    weight *= smooth(869, 903, py) * (1 - smooth(984, 1030, py))
    arm.data[i].co.x -= 18 / 512 * weight
    arm.data[i].co.y += 55 / 512 * weight

swipe_keys = ((1, 0), (18, 0), (24, 0), (36, 1), (40, 1), (49, 0), (97, 0))
for frame, value in swipe_keys:
    arm.value = value
    arm.keyframe_insert(data_path='value', frame=frame)

for frame in range(1, 98):
    phase = 2 * math.pi * (frame - 1) / 96
    breathing = (1 - math.cos(phase * 2)) / 2
    for key, value in ((head, math.sin(phase)),
                       (tail, math.sin(phase + 0.6)),
                       (breath, breathing)):
        key.slider_min = -1
        key.value = value
        key.keyframe_insert(data_path='value', frame=frame)
    scene.frame_set(frame)
    swipe = arm.value
    point_hand.location = (-18 / 512 * swipe, 55 / 512 * swipe + 0.018 * breathing, 0.02)
    point_hand.keyframe_insert(data_path='location', frame=frame)
    rest_hand.location = (0, 0.018 * breathing, 0.01)
    rest_hand.keyframe_insert(data_path='location', frame=frame)

# Clamp interpolation to avoid eyelid flutter and wrist overshoot.
for datablock in (material.node_tree, point_hand, rest_hand,
                  point_hand.data.materials[0].node_tree,
                  rest_hand.data.materials[0].node_tree, mesh.shape_keys):
    if datablock.animation_data and datablock.animation_data.action:
        for layer in datablock.animation_data.action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        for point in curve.keyframe_points:
                            point.handle_left_type = 'AUTO_CLAMPED'
                            point.handle_right_type = 'AUTO_CLAMPED'

camera_data = bpy.data.cameras.new('Chibi orthographic camera')
camera = bpy.data.objects.new('Chibi orthographic camera', camera_data)
scene.collection.objects.link(camera)
camera.location = (0, 0, 5)
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 3.08
scene.camera = camera
scene.frame_set(1)
image.pack()
OUTPUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT / 'biller-operator-mascot.blend'), copy=True)
print('Chibi mesh rig ready:', OUTPUT)
