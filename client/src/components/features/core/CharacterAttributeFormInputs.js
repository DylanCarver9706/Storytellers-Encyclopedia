import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
} from "@mui/material";

const inputStyles = {
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiSelect-icon": {
    color: "white",
  },
};

const selectStyles = {
  ...inputStyles,
  "& .MuiSelect-select": {
    color: "white",
  },
};

const menuItemStyles = {
  "&.MuiMenuItem-root": {
    color: "white",
    backgroundColor: "#1e1e1e",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
  "&.Mui-selected": {
    backgroundColor: "#2a2a2a",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
};

const sliderStyles = {
  color: "white",
  "& .MuiSlider-rail": {
    color: "rgba(255, 255, 255, 0.23)",
  },
  "& .MuiSlider-track": {
    color: "white",
  },
  "& .MuiSlider-thumb": {
    color: "white",
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "#1e1e1e",
    color: "white",
  },
};

const CharacterAttributeFormInputs = ({ category, attributes, onChange, values }) => {
  const handleTextChange = (name) => (event) => {
    onChange(name, event.target.value);
  };

  const handleMultiSelectChange = (name) => (event) => {
    onChange(name, event.target.value);
  };

  const handleSliderChange = (name) => (event, newValue) => {
    onChange(name, newValue);
  };

  const renderFormField = (attribute) => {
    if (!values[category.name][attribute.name]["inUse"]) {
      return null;
    }
    const value = values[category.name][attribute.name]["value"] || attribute.default;

    switch (attribute.type) {
      case "Text":
        return (
          <TextField
            fullWidth
            label={attribute.name}
            value={value}
            onChange={handleTextChange(attribute.name)}
            margin="normal"
            multiline={attribute.name === "Description"}
            rows={attribute.name === "Description" ? 4 : 1}
            sx={inputStyles}
          />
        );

      case "Number":
        return (
          <TextField
            fullWidth
            type="number"
            label={attribute.name}
            value={value}
            onChange={handleTextChange(attribute.name)}
            margin="normal"
            sx={inputStyles}
          />
        );

      case "Multi-Select":
        if (!attribute.options) return null;

        const hasNestedOptions = attribute.options.some(
          (option) => typeof option === "object" && option.isSection
        );

        return (
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {attribute.name}
            </InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={handleMultiSelectChange(attribute.name)}
              renderValue={(selected) => selected.join(", ")}
              sx={selectStyles}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#1e1e1e",
                    "& .MuiMenuItem-root": menuItemStyles,
                    "& .MuiDivider-root": {
                      borderColor: "rgba(255, 255, 255, 0.12)",
                    },
                  },
                },
              }}
            >
              {hasNestedOptions
                ? attribute.options.map((section) => [
                    <MenuItem
                      key={section.label}
                      disabled
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {section.label}
                    </MenuItem>,
                    ...section.options.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ ...menuItemStyles, paddingLeft: 4 }}
                      >
                        <Checkbox
                          checked={value?.includes(option)}
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "white",
                            },
                          }}
                        />
                        {option}
                      </MenuItem>
                    )),
                  ])
                : attribute.options.map((option) => {
                    if (option === "[line-divider]") {
                      return (
                        <hr
                          key={`divider-${option}`}
                          style={{ borderColor: "rgba(255, 255, 255, 0.12)" }}
                        />
                      );
                    }
                    return (
                      <MenuItem key={option} value={option} sx={menuItemStyles}>
                        <Checkbox
                          checked={value?.includes(option)}
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "white",
                            },
                          }}
                        />
                        {option}
                      </MenuItem>
                    );
                  })}
            </Select>
          </FormControl>
        );

      case "Slider":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                transform: "translate(0, -1.5rem)",
              }}
            >
              {attribute.name}
            </InputLabel>
            <Slider
              value={typeof value === "number" ? value : attribute.default}
              onChange={handleSliderChange(attribute.name)}
              min={attribute.min}
              max={attribute.max}
              step={attribute.step}
              valueLabelDisplay="auto"
              marks
              sx={sliderStyles}
            />
          </FormControl>
        );

      case "Color":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                transform: "translate(0, -1.5rem)",
              }}
            >
              {attribute.name}
            </InputLabel>
            <input
              type="color"
              value={value || "#FFFFFF"}
              onChange={handleTextChange(attribute.name)}
              style={{
                width: "100%",
                height: "50px",
                backgroundColor: "#1e1e1e",
                border: "1px solid rgba(255, 255, 255, 0.23)",
                borderRadius: "4px",
                padding: "4px",
              }}
            />
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <div className="basic-info-attributes">
      {attributes?.map((attribute) => (
        <div key={attribute.name} className="attribute-field">
          {renderFormField(attribute)}
        </div>
      ))}
    </div>
  );
};

export default CharacterAttributeFormInputs;
