import { DimensionSetting, DimensionGap } from "../types";

const API_BASE = "http://localhost:3001/api";

export const dimensionSettingsApi = {
  // Fetch all dimension targets
  async fetchDimensionSettings(): Promise<Record<string, DimensionSetting>> {
    const response = await fetch(`${API_BASE}/settings/dimensions`);
    if (!response.ok) {
      throw new Error("Failed to fetch dimension settings");
    }
    return response.json();
  },

  // Save all dimension targets
  async saveDimensionSettings(
    settings: Record<string, DimensionSetting>,
  ): Promise<{ success: boolean; count: number }> {
    const response = await fetch(`${API_BASE}/settings/dimensions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error("Failed to save dimension settings");
    }
    return response.json();
  },

  // Update specific dimension
  async updateDimensionSetting(
    dimension: string,
    setting: Partial<DimensionSetting>,
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE}/settings/dimensions/${encodeURIComponent(dimension)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setting),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update dimension setting");
    }
    return response.json();
  },

  // Delete dimension target (revert to default)
  async deleteDimensionSetting(
    dimension: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `${API_BASE}/settings/dimensions/${encodeURIComponent(dimension)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete dimension setting");
    }
    return response.json();
  },

  // Fetch gap analysis
  async fetchDimensionGaps(): Promise<Record<string, DimensionGap>> {
    const response = await fetch(`${API_BASE}/settings/dimensions/gaps`);
    if (!response.ok) {
      throw new Error("Failed to fetch dimension gaps");
    }
    return response.json();
  },

  // Update gap analysis (calculated from current data)
  async updateDimensionGaps(
    gaps: Array<{
      dimension: string;
      currentLevel: number;
      targetLevel: number;
      currentScore: number;
      gapPercentage: number;
      status: string;
    }>,
  ): Promise<{ success: boolean; count: number }> {
    const response = await fetch(`${API_BASE}/settings/dimensions/gaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gaps),
    });
    if (!response.ok) {
      throw new Error("Failed to update dimension gaps");
    }
    return response.json();
  },

  // Apply industry preset weights
  async applyIndustryPreset(
    industry: string,
  ): Promise<{
    success: boolean;
    industry: string;
    weights: Record<string, number>;
    count: number;
  }> {
    const response = await fetch(
      `${API_BASE}/settings/industry-presets/${industry}`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to apply industry preset");
    }
    return response.json();
  },
};
