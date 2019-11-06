# Timers

`PCTracking.utils.timer()` creates an object that tracks time, and can be paused, restarted, or initialized with a known value (seconds). It seems simple, but these little do-dads are excellent for recording the duration of sessions or specific interactions.

```javascript
import PCTracking from 'pc-tracking';

const userActivity = PCTracking.utils.timer();

// Start the timer
userActivity.start();

// Pause the timer
userActivity.pause();

// Return the value of the timer (seconds)
userActivity.value(); // 10

// Clear the current value of the timer
userActivity.clear();

// Start from a given number
const historicalActivity = PCTracking.utils.timer(3132).start();
historicalActivity.pause();
```
