
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform sampler2D texture;



void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 image = texture2D(texture,uv);
//grain = 1.0 - grain;
    gl_FragColor = image;//finalColor;
}
