/**
 * Repeat-mode state machine for the audio player.
 *
 * `continuous` (the long-standing playlist loop) and repeatMode 'surah' are the
 * same behaviour, so they must never disagree — older call sites still use
 * setContinuous while the player UI uses setRepeatMode.
 *
 * Run: npm run test:audio-repeat
 */
import assert from 'node:assert/strict';
import { useAudioStore } from '../src/stores/audioStore.ts';

const s = () => useAudioStore.getState();
const reset = () => useAudioStore.setState({ repeatMode: 'off', repeatRange: null, continuous: false });

// --- defaults ---------------------------------------------------------------
reset();
assert.equal(s().repeatMode, 'off', 'repeat starts off');
assert.equal(s().continuous, false, 'continuous starts off');
assert.equal(s().repeatRange, null, 'no range by default');

// --- setContinuous keeps repeatMode in step ---------------------------------
reset();
s().setContinuous(true);
assert.equal(s().repeatMode, 'surah', 'setContinuous(true) => surah repeat');
s().setContinuous(false);
assert.equal(s().repeatMode, 'off', 'setContinuous(false) => off');

// turning continuous off must not clobber an unrelated mode
reset();
s().setRepeatMode('ayah');
s().setContinuous(false);
assert.equal(s().repeatMode, 'ayah', 'continuous=false leaves ayah repeat alone');

// --- setRepeatMode keeps continuous in step ---------------------------------
reset();
s().setRepeatMode('surah');
assert.equal(s().continuous, true, 'surah repeat => continuous true');
s().setRepeatMode('ayah');
assert.equal(s().continuous, false, 'ayah repeat => continuous false');
s().setRepeatMode('off');
assert.equal(s().continuous, false, 'off => continuous false');

// --- ranges -----------------------------------------------------------------
reset();
s().setRepeatMode('range', { start: 3, end: 7 });
assert.deepEqual(s().repeatRange, { start: 3, end: 7 }, 'range stored');
assert.equal(s().repeatMode, 'range');

// switching mode must not silently discard the range the user picked
s().setRepeatMode('ayah');
assert.deepEqual(s().repeatRange, { start: 3, end: 7 }, 'range survives a mode change');

// explicit null clears it
s().setRepeatRange(null);
assert.equal(s().repeatRange, null, 'range cleared explicitly');

// --- reset clears playback-scoped repeat state ------------------------------
reset();
s().setRepeatMode('range', { start: 1, end: 4 });
s().reset();
assert.equal(s().repeatRange, null, 'reset clears the range');
assert.equal(s().repeatMode, 'off', 'reset clears repeat mode');
assert.equal(s().continuous, false, 'reset clears continuous');

console.log('test-audio-repeat: ok');
