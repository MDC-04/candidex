package com.candidex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApplications;
    private long appliedCount;
    private long interviewCount;
    private long offerCount;
    private long rejectedCount;
    private Map<String, Long> statusBreakdown;
}
