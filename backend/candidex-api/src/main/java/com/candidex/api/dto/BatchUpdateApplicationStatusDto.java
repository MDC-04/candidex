package com.candidex.api.dto;

import com.candidex.api.model.enums.ApplicationStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchUpdateApplicationStatusDto {

    @NotEmpty
    private List<String> ids;

    @NotNull
    private ApplicationStatus status;
}