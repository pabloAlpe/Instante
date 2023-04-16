#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform sampler2D texture;
uniform sampler2D texture2;
uniform float u_borde;
uniform float u_potencia;
uniform vec3 u_col;
float saturate(float t) {
  return clamp(t, 0.0, 1.0);
}

vec2 saturate(vec2 t) {
  return clamp(t, 0.0, 1.0);
}

float remap(float t, float a, float b) {
  return saturate((t - a) / (b - a));
}

float linear_interpolation(float t) {
  return saturate(1.0 - abs(2.0 * t - 1.0));
}

vec3 spectral_offset(float t) {
  vec3 result;
  float lower_half = step(t, 0.5);
  float upper_half = 1.0 - lower_half;
  float weight = linear_interpolation(remap(t, 1.0 / 6.0, 5.0 / 6.0));
  float neg_weight = 1.0 - weight;
  result = vec3(lower_half, 1.0, upper_half) * vec3(neg_weight, weight, neg_weight);
  return pow(result, vec3(0.));
}

float random_value(vec2 n) {
  return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float signed_random_value(vec2 n) {
  return random_value(n) * 2.0 - 1.0;
}

float truncate_value(float x, float num_levels) {
  return floor(x * num_levels) / num_levels;
}

vec2 truncate_value(vec2 x, float num_levels) {
  return floor(x * num_levels) / num_levels;
}

void main() {
  vec2 uv_coords = vTexCoord;
  uv_coords.y = 1.0 - uv_coords.y;
  vec2 uv_coords_ = uv_coords;
  vec4 image = texture2D(texture, uv_coords);
  

  float glitch_amount =  u_potencia / (vTexCoord.y);
  float glitch_normalized = saturate(glitch_amount);
  float rand_0 = random_value(truncate_value(vec2(0.2, 0.2), 20.0));
  float random_val_0 = saturate((1.0 - glitch_normalized) * 0.7 + rand_0);
  float rand_1 = random_value(vec2(truncate_value(uv_coords.x, 10.0 * random_val_0), 0.2));
  float random_val_1 = 0.5 - 0.5 * glitch_normalized + rand_1;
  random_val_1 = 1.0 - max(0.0, ((random_val_1 < 1.0) ? random_val_1 : 0.9999999));
  float rand_2 = random_value(vec2(truncate_value(uv_coords.y, 10.0 * random_val_1), 0.2));
  float random_val_2 = saturate(rand_2);

  float rand_3 = random_value(vec2(truncate_value(uv_coords.y, 10.0 * random_val_0), 0.2));
  float random_val_3 = (1.0 - saturate(rand_3 + 0.8)) - 0.1;

float px_random = random_value(uv_coords + 0.2);

float offset = 0.05 * random_val_2 * glitch_amount * (rand_0 > 0.5 ? 1.0 : -1.0);
offset += 0.5 * px_random * offset;

uv_coords.y += 0.1 * random_val_3 * glitch_amount;

const int NUM_SAMPLES = 20;
const float RCP_NUM_SAMPLES_F = 1.0 / float(NUM_SAMPLES);

vec4 sum = vec4(0.0);
vec3 wsum = vec3(0.0);
for (int i = 0; i < NUM_SAMPLES; ++i) {
  float t = float(i) * RCP_NUM_SAMPLES_F;
  uv_coords.x = saturate(uv_coords.x + offset * t);
  vec4 samplecol = texture2D(texture, uv_coords);
  

  vec3 s = spectral_offset(t);
  samplecol.rgb = samplecol.rgb * (s);
  sum += samplecol;
  wsum += s;
}
sum.rgb /= wsum;
sum.a *= RCP_NUM_SAMPLES_F;

vec4 final_color = vec4(1.0);
final_color.a = sum.a;
final_color.rgb = sum.rgb;


if (uv_coords_.x > u_borde || uv_coords_.x < 1.0 - u_borde || uv_coords_.y > u_borde || uv_coords_.y < 1.0 - u_borde) {
  final_color.rgb = u_col;
}

gl_FragColor = final_color;
}

