local showing = false

-- ============================
-- OPEN UI (with default timer)
-- ============================

RegisterCommand("flow", function()
    -- 🕒 Optional: default time limit for this puzzle (e.g. 30 seconds)
    -- Server owners can override with exports['cr-flow']:SetFlowTimer(x) elsewhere.
    exports['cr-flow']:SetFlowTimer(15)

    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open" })
    showing = true
end)

-- ============================
-- CLOSE (manual / ESC key)
-- ============================

RegisterNUICallback("close", function(_, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false
    cb("ok")
end)

-- ============================
-- SUCCESS (player solved puzzle)
-- Called after 2s delay in JS checkComplete()
-- ============================

RegisterNUICallback("success", function(_, cb)
    print("PUZZLE COMPLETE!")
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false

    -- notify server that player completed successfully
    TriggerServerEvent("flow:puzzleCompleted")
    cb("ok")
end)

-- ============================
-- TIMER FAIL (JS timer ran out)
-- timer.js -> fetch(.../fail)
-- ============================

RegisterNUICallback("fail", function(_, cb)
    print("FLOW FAILED (timer ran out)")

    -- 🔊 play the fail sound for timeout
    exports['cr-flow']:FailSound()

    -- close UI
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false

    -- tell server you failed (if you want to hook this)
    TriggerServerEvent("flow:puzzleFailed")

    cb("ok")
end)

-- ============================
-- NUI → SOUND TRIGGERS
-- ============================

RegisterNUICallback("pair", function(_, cb)
    exports['cr-flow']:PairSound()
    cb("ok")
end)

-- this one is for pipe-overwrite / manual fail sound
RegisterNUICallback("failsound", function(_, cb)
    exports['cr-flow']:FailSound()
    cb("ok")
end)

RegisterNUICallback("complete", function(_, cb)
    exports['cr-flow']:PuzzleCompleteSound()
    cb("ok")
end)

-- ============================
-- SOUND EXPORTS (UPDATED)
-- ============================

-- When a pair is successfully linked
exports('PairSound', function()
    PlaySoundFrontend(-1, "Pin_Good", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- When a link breaks or is overwritten / timer fail
exports('FailSound', function()
    PlaySoundFrontend(-1, "Pin_Bad", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- When the entire puzzle is completed
exports('PuzzleCompleteSound', function()
    PlaySoundFrontend(-1, "Hack_Success", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- ============================
-- EXPORT: Set puzzle time limit
-- Called from any other client script:
--   exports['cr-flow']:SetFlowTimer(25)
-- ============================

exports('SetFlowTimer', function(seconds)
    SendNUIMessage({
        action = "setTimer",
        time = tonumber(seconds)
    })
end)
