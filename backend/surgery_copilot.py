# Copyright (c) 2025 ot6_j. All Rights Reserved.

def analyze_surgical_context(tool_count, hand_count, blood_percent, sharpness):
    """Analyzes surgical context regarding tools, hands, blood, and visibility."""
    suggestion = "Standard procedure. Continue."
    status = "NOMINAL"
    phase = "UNKNOWN"
    priority = "low"
    
    if tool_count > 0 and hand_count > 0:
        if blood_percent < 5.0:
            phase = "PREPARATION"
        elif blood_percent < 15.0:
            phase = "INCISION"
        else:
            phase = "HEMOSTASIS"
    elif tool_count > 0:
        phase = "TOOLS READY"
    elif hand_count > 0:
        phase = "MANUAL MANIPULATION"
    else:
        phase = "CLEAR FIELD"
    
    if blood_percent > 25.0:
        status = "EMERGENCY"
        priority = "critical"
        if tool_count == 0:
            suggestion = "MASSIVE HEMORRHAGE! Immediate intervention required."
        else:
            suggestion = "Active hemorrhage. Maintain pressure."
    
    elif blood_percent > 15.0:
        status = "CRITICAL"
        priority = "high"
        if tool_count == 0 and hand_count == 0:
            suggestion = "Significant hemorrhage. Action required."
        else:
            suggestion = "Active bleeding. Control source."
    
    elif blood_percent > 8.0 and tool_count == 0:
        status = "WARNING"
        priority = "medium"
        suggestion = "Residual bleeding. Check hemostasis."
    
    elif sharpness < 50:
        status = "WARNING"
        priority = "medium"
        suggestion = "Critical visibility. Clean lens or clear smoke."
    
    elif sharpness < 100:
        status = "ALERT"
        priority = "low"
        suggestion = "Reduced visibility. Check lighting."
    
    elif tool_count > 2:
        status = "ALERT"
        priority = "low"
        suggestion = "Cluttered field. Remove unnecessary tools."
    
    elif tool_count > 0 or hand_count > 0:
        status = "ACTIVE"
        priority = "low"
        if blood_percent < 3.0:
            suggestion = "Surgery in progress. Good visibility."
        else:
            suggestion = "Minor bleeding normal. Monitor."
    
    else:
        status = "STANDBY"
        priority = "low"
        suggestion = "No activity detected."
    
    return {
        "phase_op": phase,
        "status": status,
        "ai_suggestion": suggestion,
        "priority": priority,
        "blood_level": "critical" if blood_percent > 20 else "high" if blood_percent > 10 else "moderate" if blood_percent > 5 else "low",
        "visibility_status": "critical" if sharpness < 50 else "reduced" if sharpness < 100 else "good" if sharpness < 500 else "excellent"
    }

def get_surgical_guidance(tool_count, hand_visible, hemorrhage_probability, visibility_score):
    """Fallback guidance when models are unavailable."""
    return {
        "alert_level": "green",
        "status": "SIMULATED",
        "suggestion": "System running in simulation mode.",
        "phase": "SIMULATION"
    }
