import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Slider,
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
};

const selectStyles = {
  ...inputStyles,
  "& .MuiSelect-icon": {
    color: "rgba(255, 255, 255, 0.7)",
  },
};

const menuItemStyles = {
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(63, 81, 181, 0.2)",
    "&:hover": {
      backgroundColor: "rgba(63, 81, 181, 0.3)",
    },
  },
};

const sliderStyles = {
  color: "#3f51b5",
  "& .MuiSlider-thumb": {
    backgroundColor: "#3f51b5",
  },
  "& .MuiSlider-track": {
    backgroundColor: "#3f51b5",
  },
  "& .MuiSlider-rail": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  "& .MuiSlider-mark": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  "& .MuiSlider-markLabel": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "#3f51b5",
    color: "white",
  },
};

const CharacterAttributeFormInputs = ({
  category,
  attributes,
  onChange,
  values,
}) => {
  const handleTextChange = (name) => (event) => {
    onChange(category, name, event.target.value);
  };

  const handleMultiSelectChange = (name) => (event) => {
    const selectedValues = event.target.value;
    onChange(category, name, selectedValues);
  };

  const handleSliderChange = (name) => (event, newValue) => {
    onChange(category, name, newValue);
  };

  const renderSectionedMultiSelect = (attrName, attribute, value) => (
    <FormControl fullWidth margin="normal">
      <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
        {attrName}
      </InputLabel>
      <Select
        multiple
        value={Array.isArray(value) ? value : []}
        onChange={handleMultiSelectChange(attrName)}
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
        {attribute.options.flatMap((section) => [
          <MenuItem
            key={section.label}
            disabled
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            {section.label}
          </MenuItem>,
          ...section.options
            .filter((option) => typeof option === "string")
            .map((option) => (
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
            )),
        ])}
      </Select>
    </FormControl>
  );

  const renderFlatMultiSelect = (attrName, attribute, value) => (
    <FormControl fullWidth margin="normal">
      <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
        {attrName}
      </InputLabel>
      <Select
        multiple
        value={Array.isArray(value) ? value : []}
        onChange={handleMultiSelectChange(attrName)}
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
        {attribute.options
          .filter((option) => typeof option === "string")
          .map((option) => (
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
          ))}
      </Select>
    </FormControl>
  );

  const renderFormField = (attrName, attribute) => {
    if (!attribute.inUse) {
      return null;
    }

    const value =
      attribute.value !== undefined && attribute.value !== null
        ? attribute.value
        : attribute.default;

    switch (attribute.type) {
      case "Text":
        return (
          <TextField
            fullWidth
            label={attrName}
            value={value}
            onChange={handleTextChange(attrName)}
            margin="normal"
            multiline={attrName === "Description"}
            rows={attrName === "Description" ? 4 : 1}
            sx={inputStyles}
          />
        );

      case "Number":
        return (
          <TextField
            fullWidth
            type="number"
            label={attrName}
            value={parseFloat(value)}
            onChange={handleTextChange(attrName)}
            margin="normal"
            sx={inputStyles}
          />
        );

      case "Multi-Select":
        if (!attribute.options) return null;
        const hasNestedOptions = attribute.options.some(
          (option) => typeof option === "object" && option.isSection
        );
        return hasNestedOptions
          ? renderSectionedMultiSelect(attrName, attribute, value)
          : renderFlatMultiSelect(attrName, attribute, value);

      case "Slider":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                transform: "translate(0, -1.5rem)",
              }}
            >
              {attrName}
            </InputLabel>
            <Slider
              value={typeof value === "number" ? value : attribute.default}
              onChange={handleSliderChange(attrName)}
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
              {attrName}
            </InputLabel>
            <input
              type="color"
              value={value || "#FFFFFF"}
              onChange={handleTextChange(attrName)}
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
      {Object.entries(attributes).map(([attrName, attribute]) => (
        <div key={attrName} className="attribute-field">
          {renderFormField(attrName, attribute)}
        </div>
      ))}
    </div>
  );
};

export default CharacterAttributeFormInputs;
