#include "input.h"

#include "GameValues.h"
#include "GlobalConstants.h"

#include <unordered_map>

extern CGameValues game_values;

#ifdef __EMSCRIPTEN__
namespace {
enum TouchAction : int {
    TouchUp = 1 << 0,
    TouchDown = 1 << 1,
    TouchLeft = 1 << 2,
    TouchRight = 1 << 3,
    TouchAction = 1 << 4,
    TouchCancel = 1 << 5,
};

std::unordered_map<SDL_FingerID, int> touch_actions;
short last_touch_game_state = 1;
int remote_player_mask = 0;

int actionForTouch(const SDL_TouchFingerEvent& touch)
{
    // Left side: a four-way thumb pad. Right side: a large action button.
    if (touch.x > 0.86f && touch.y < 0.26f)
        return TouchCancel;
    if (touch.x < 0.42f && touch.y > 0.45f) {
        const float dx = touch.x - 0.20f;
        const float dy = touch.y - 0.75f;
        if (dx * dx > dy * dy)
            return dx < 0.0f ? TouchLeft : TouchRight;
        return dy < 0.0f ? TouchUp : TouchDown;
    }
    if (touch.x > 0.67f && touch.y > 0.45f)
        return TouchAction;
    return 0;
}

void applyTouchActions(COutputControl& output, short gameState)
{
    int combined = 0;
    for (const auto& [fingerId, actions] : touch_actions)
        combined |= actions;

    const bool gameKeys[NUM_KEYS] = {
        (combined & TouchLeft) != 0,
        (combined & TouchRight) != 0,
        (combined & TouchUp) != 0 || (combined & TouchAction) != 0,
        (combined & TouchDown) != 0,
        (combined & TouchAction) != 0,
        false,
        false,
        (combined & TouchCancel) != 0,
    };
    const bool menuKeys[NUM_KEYS] = {
        (combined & TouchUp) != 0,
        (combined & TouchDown) != 0,
        (combined & TouchLeft) != 0,
        (combined & TouchRight) != 0,
        (combined & TouchAction) != 0,
        (combined & TouchCancel) != 0,
        false,
        false,
    };
    const bool* keys = gameState == 0 ? gameKeys : menuKeys;
    for (int key = 0; key < NUM_KEYS; key++) {
        if (keys[key] && !output.keys[key].fDown)
            output.keys[key].fPressed = true;
        output.keys[key].fDown = keys[key];
    }
}

void applyRemoteGameplayActions(COutputControl& output, int actions)
{
    const bool gameKeys[NUM_KEYS] = {
        (actions & TouchLeft) != 0,
        (actions & TouchRight) != 0,
        (actions & TouchUp) != 0 || (actions & TouchAction) != 0,
        (actions & TouchDown) != 0,
        (actions & TouchAction) != 0,
        false,
        false,
        (actions & TouchCancel) != 0,
    };

    for (int key = 0; key < NUM_KEYS; key++) {
        if (gameKeys[key] && !output.keys[key].fDown)
            output.keys[key].fPressed = true;
        output.keys[key].fDown = gameKeys[key];
    }
}
} // namespace

bool pudgywars_remote_player_active(short player)
{
    return player >= 0 && player < MAX_PLAYERS && (remote_player_mask & (1 << player)) != 0;
}

extern "C" void pudgywars_mobile_control(int slot, int action, int pressed)
{
    (void)slot;
    // Once a phone has claimed player one, the host remains responsible for
    // menus but must not compete with that controller during gameplay.
    if (last_touch_game_state == 0 && (remote_player_mask & 1) != 0)
        return;
    CInputPlayerControl* player = game_values.playerInput.inputControls[0];
    if (!player)
        return;

    auto push_key = [pressed](SDL_Keycode key) {
        if (key == KEY_NONE)
            return;
        SDL_Event event{};
        event.type = pressed ? SDL_KEYDOWN : SDL_KEYUP;
        event.key.state = pressed ? SDL_PRESSED : SDL_RELEASED;
        event.key.repeat = 0;
        event.key.keysym.sym = key;
        SDL_PushEvent(&event);
    };

    const CInputControl& keys = player->inputGameControls[last_touch_game_state == 0 ? 0 : 1];
    if (last_touch_game_state == 0) {
        if (action & TouchLeft) push_key(keys.game_left);
        if (action & TouchRight) push_key(keys.game_right);
        if (action & TouchUp) push_key(keys.game_jump);
        if (action & TouchDown) push_key(keys.game_down);
        if (action & TouchAction) {
            push_key(keys.game_jump);
            push_key(keys.game_turbo);
        }
        if (action & TouchCancel) push_key(keys.game_cancel);
    } else {
        if (action & TouchUp) push_key(keys.menu_up);
        if (action & TouchDown) push_key(keys.menu_down);
        if (action & TouchLeft) push_key(keys.menu_left);
        if (action & TouchRight) push_key(keys.menu_right);
        if (action & TouchAction) push_key(keys.menu_select);
        if (action & TouchCancel) push_key(keys.menu_cancel);
    }
}

extern "C" void pudgywars_set_remote_players(int active_mask)
{
    remote_player_mask = active_mask & 0x0f;
    for (int player = 0; player < MAX_PLAYERS; player++) {
        // Keep player one enabled as the host's menu/start fallback. A claimed
        // remote player one still owns that slot during active gameplay.
        const bool enabled = player == 0 || (remote_player_mask & (1 << player)) != 0;
        game_values.playercontrol[player] = enabled ? 1 : 0;
        if (!enabled)
            applyRemoteGameplayActions(game_values.playerInput.outputControls[player], 0);
    }
}

extern "C" void pudgywars_set_browser_input_mode(short game_state)
{
    last_touch_game_state = game_state;
}

extern "C" void pudgywars_remote_control(int player, int actions)
{
    if (player < 0 || player >= MAX_PLAYERS)
        return;
    if (last_touch_game_state != 0 || (remote_player_mask & (1 << player)) == 0) {
        applyRemoteGameplayActions(game_values.playerInput.outputControls[player], 0);
        return;
    }
    applyRemoteGameplayActions(game_values.playerInput.outputControls[player], actions);
}
#endif

CPlayerInput::CPlayerInput()
{
    for (int iPlayer = 0; iPlayer < MAX_PLAYERS; iPlayer++) {
        for (int iKey = 0; iKey < NUM_KEYS; iKey++) {
			outputControls[iPlayer].keys[iKey].fPressed = false;
			outputControls[iPlayer].keys[iKey].fDown = false;
		}
	}

    iPressedKey = 0;
}

//Pass in 0 for game and 1 for menu
//Clear old button pushed states
void CPlayerInput::ClearPressedKeys(short iGameState)
{
    for (int iPlayer = 0; iPlayer < MAX_PLAYERS; iPlayer++) {
        COutputControl* outputControl = &outputControls[iPlayer];
        for (int iKey = 0; iKey < NUM_KEYS; iKey++) {
            outputControl->keys[iKey].fPressed = false;
        }
    }

    iPressedKey = 0;
}

void CPlayerInput::ClearGameActionKeys()
{
    for (int iPlayer = 0; iPlayer < MAX_PLAYERS; iPlayer++) {
		COutputControl * outputControl = &outputControls[iPlayer];

		// 0-3: direction keys, 4: turbo
        for (int iKey = 5; iKey < NUM_KEYS; iKey++) {
			outputControl->keys[iKey].fPressed = false;
			outputControl->keys[iKey].fDown = false;
		}
	}

	iPressedKey = 0;
}

//Clear all button pushed and down states
//Call this when switching from menu to game
void CPlayerInput::ResetKeys()
{
    for (int iPlayer = 0; iPlayer < MAX_PLAYERS; iPlayer++) {
        for (int iKey = 0; iKey < NUM_KEYS; iKey++) {
			outputControls[iPlayer].keys[iKey].fPressed = false;
			outputControls[iPlayer].keys[iKey].fDown = false;
		}
	}

	iPressedKey = 0;
}

//Called during game loop to read input events and see if
//configured keys were pressed.  If they were, then turn on
//key flags to be used by game logic
//iGameState == 0 for in game and 1 for menu
void CPlayerInput::Update(SDL_Event event, short iGameState)
{
	#ifdef __EMSCRIPTEN__
    last_touch_game_state = iGameState;
    if (event.type == SDL_FINGERDOWN || event.type == SDL_FINGERMOTION || event.type == SDL_FINGERUP) {
        if (event.type == SDL_FINGERUP)
            touch_actions.erase(event.tfinger.fingerId);
        else
            touch_actions[event.tfinger.fingerId] = actionForTouch(event.tfinger);
        applyTouchActions(outputControls[0], iGameState);
        return;
    }
#endif

	bool fFound = false;
    for (short iPlayer = -1; iPlayer < MAX_PLAYERS; iPlayer++) {
		CInputControl * inputControl;
		COutputControl * outputControl;
		short iDeviceID = DEVICE_KEYBOARD;

		//Allow keyboard input from player 1 at all times (even when he is configured to use joystick)
        if (iPlayer == -1) {
            if (iGameState == 1 && inputControls[0]->iDevice != DEVICE_KEYBOARD) {
				inputControl = &game_values.inputConfiguration[0][0].inputGameControls[1];
				outputControl = &outputControls[0];
				iDeviceID = game_values.inputConfiguration[0][0].iDevice;
            } else {
				continue;
			}
        } else {
			if (!inputControls[iPlayer])
				continue;

			inputControl = &inputControls[iPlayer]->inputGameControls[iGameState];
			outputControl = &outputControls[iPlayer];
			iDeviceID = inputControls[iPlayer]->iDevice;
		}

        if (iDeviceID == DEVICE_KEYBOARD) {
            if (SDL_KEYDOWN == event.type) {
                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.key.keysym.sym) {
						fFound = true;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						if (!outputControl->keys[iKey].fDown)
							outputControl->keys[iKey].fPressed = true;

						outputControl->keys[iKey].fDown = true;
					}
				}

				iPressedKey = event.key.keysym.sym;
            } else if (SDL_KEYUP == event.type) {
                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.key.keysym.sym) {
						fFound = true;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						outputControl->keys[iKey].fDown = false;
					}
				}
            } else if (SDL_MOUSEMOTION == event.type) {
                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] >= MOUSE_UP) {
						if ((inputControl->keys[iKey] == MOUSE_UP && event.motion.yrel < -MOUSE_Y_DEAD_ZONE) ||
							(inputControl->keys[iKey] == MOUSE_DOWN && event.motion.yrel > MOUSE_Y_DEAD_ZONE) ||
							(inputControl->keys[iKey] == MOUSE_LEFT && event.motion.xrel < -MOUSE_X_DEAD_ZONE) ||
							(inputControl->keys[iKey] == MOUSE_RIGHT && event.motion.xrel > MOUSE_X_DEAD_ZONE) ||
                                (inputControl->keys[iKey] >= MOUSE_BUTTON_START && (event.motion.state & SDL_BUTTON(inputControl->keys[iKey] - MOUSE_BUTTON_START)))) {
							fFound = true;

							//Ignore input for cpu controlled players
							if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
								continue;

							if (!outputControl->keys[iKey].fDown)
								outputControl->keys[iKey].fPressed = true;

							outputControl->keys[iKey].fDown = true;
                        } else {
							//Ignore input for cpu controlled players
							if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
								continue;

							//Mouse scroll wheel up/down events happen on same frame so ignore up event (and clear it in the ClearPressedKeys() method)
							if (inputControl->keys[iKey] == MOUSE_BUTTON_START + 4 || inputControl->keys[iKey] == MOUSE_BUTTON_START + 5)
								continue;

							outputControl->keys[iKey].fDown = false;
						}
					}
				}
            } else if (SDL_MOUSEBUTTONDOWN == event.type) {
                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.button.button + MOUSE_BUTTON_START) {
						fFound = true;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						if (!outputControl->keys[iKey].fDown)
							outputControl->keys[iKey].fPressed = true;

						outputControl->keys[iKey].fDown = true;
					}
				}
            } else if (SDL_MOUSEBUTTONUP == event.type) {
                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.button.button + MOUSE_BUTTON_START) {
						fFound = true;

						//Mouse scroll wheel up/down events happen on same frame so ignore up event (and clear it in the ClearPressedKeys() method)
						if (inputControl->keys[iKey] == MOUSE_BUTTON_START + 4 || inputControl->keys[iKey] == MOUSE_BUTTON_START + 5)
							continue;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						outputControl->keys[iKey].fDown = false;
					}
				}
			}
        } else {
            if (SDL_JOYHATMOTION == event.type) {
				if (iDeviceID != event.jhat.which)
					continue;

                for (int iKey = 0; iKey < NUM_KEYS; iKey++) {
                    if (inputControl->keys[iKey] >= JOY_HAT_UP && inputControl->keys[iKey] <= JOY_HAT_RIGHT) {
						if ((inputControl->keys[iKey] == JOY_HAT_UP && (event.jhat.value & SDL_HAT_UP)) ||
							(inputControl->keys[iKey] == JOY_HAT_DOWN && (event.jhat.value & SDL_HAT_DOWN)) ||
							(inputControl->keys[iKey] == JOY_HAT_LEFT && (event.jhat.value & SDL_HAT_LEFT)) ||
                                (inputControl->keys[iKey] == JOY_HAT_RIGHT && (event.jhat.value & SDL_HAT_RIGHT))) {
							fFound = true;

							//Ignore input for cpu controlled players
							if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
								continue;

							if (!outputControl->keys[iKey].fDown)
								outputControl->keys[iKey].fPressed = true;

							outputControl->keys[iKey].fDown = true;
                        } else {
							//Ignore input for cpu controlled players
							if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
								continue;

							outputControl->keys[iKey].fDown = false;
						}
					}
				}
            } else if (SDL_JOYBUTTONDOWN == event.type) {
				if (iDeviceID != event.jbutton.which)
					continue;

                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.jbutton.button + JOY_BUTTON_START) {
						fFound = true;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						if (!outputControl->keys[iKey].fDown)
							outputControl->keys[iKey].fPressed = true;

						outputControl->keys[iKey].fDown = true;
					}
				}
            } else if (SDL_JOYBUTTONUP == event.type) {
				if (iDeviceID != event.jbutton.which)
					continue;

                for (int iKey = 0; iKey < NUM_KEYS && !fFound; iKey++) {
                    if (inputControl->keys[iKey] == event.jbutton.button + JOY_BUTTON_START) {
						fFound = true;

						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

						outputControl->keys[iKey].fDown = false;
					}
				}
            } else if (SDL_JOYAXISMOTION == event.type) {
				if (iDeviceID != event.jaxis.which)
					continue;

                for (int iKey = 0; iKey < NUM_KEYS; iKey++) {
					bool fUseJoystickInput = false;
					bool fJoystickDown = false;

                    if (event.jaxis.axis == 0 && inputControl->keys[iKey] == JOY_STICK_1_LEFT) {
						fUseJoystickInput = true;

						if (event.jaxis.value < -JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 0 && inputControl->keys[iKey] == JOY_STICK_1_RIGHT) {
						fUseJoystickInput = true;

						if (event.jaxis.value > JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 1 && inputControl->keys[iKey] == JOY_STICK_1_UP) {
						fUseJoystickInput = true;

						if (event.jaxis.value < -JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 1 && inputControl->keys[iKey] == JOY_STICK_1_DOWN) {
						fUseJoystickInput = true;

						if (event.jaxis.value > JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 2 && inputControl->keys[iKey] == JOY_STICK_2_LEFT) {
						fUseJoystickInput = true;

						if (event.jaxis.value < -JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 2 && inputControl->keys[iKey] == JOY_STICK_2_RIGHT) {
						fUseJoystickInput = true;

						if (event.jaxis.value > JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 3 && inputControl->keys[iKey] == JOY_STICK_2_UP) {
						fUseJoystickInput = true;

						if (event.jaxis.value < -JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
                    } else if (event.jaxis.axis == 3 && inputControl->keys[iKey] == JOY_STICK_2_DOWN) {
						fUseJoystickInput = true;

						if (event.jaxis.value > JOYSTICK_DEAD_ZONE)
							fJoystickDown = true;
					}

                    if (fUseJoystickInput) {
						//Ignore input for cpu controlled players
						if (iGameState == 0 && game_values.playercontrol[iPlayer] != 1 && iKey < 6)
							continue;

                        if (fJoystickDown) {
							fFound = true;

							if (!outputControl->keys[iKey].fDown)
								outputControl->keys[iKey].fPressed = true;

							outputControl->keys[iKey].fDown = true;
                        } else {
							outputControl->keys[iKey].fDown = false;
						}
					}
				}
			}
		}

		//This line might be causing input from some players not to be read
		//if (fFound)
			//break;
	}
}
