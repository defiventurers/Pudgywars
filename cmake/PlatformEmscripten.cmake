# Emscripten config
#
set(CMAKE_EXECUTABLE_SUFFIX ".html")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS='[\"png\",\"bmp\"]' -s USE_SDL_MIXER=2 -s USE_ZLIB=1 -Wno-c++11-narrowing")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS='[\"png\",\"bmp\"]' -s USE_SDL_MIXER=2 -s USE_ZLIB=1")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s ALLOW_MEMORY_GROWTH=1 -s INVOKE_RUN=1 -s EXPORTED_FUNCTIONS=['_pudgywars_start','_pudgywars_mobile_control','_pudgywars_set_remote_players','_pudgywars_remote_control'] -s MINIFY_HTML=0 --preload-file ${CMAKE_SOURCE_DIR}/data@data")
