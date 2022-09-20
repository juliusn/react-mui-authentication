import React, { useState, forwardRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { OrderTemplate } from "Types";
import { UseFormSetValue, Control, useWatch } from "react-hook-form";
import { OrderFormValues } from ".";
import { getOrderTemplates } from "storage/readAndWriteOrders";
import { parse, isFriday, isSaturday, isSunday, isWeekend } from "date-fns";

interface TemplateSelectProps{
  control: Control<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  ref: React.Ref<HTMLInputElement | null>;
  label?: string;
}

const TemplateSelect = forwardRef(({ control, setValue, label }:TemplateSelectProps, ref) => {
  const [ template, setTemplate ] = useState<OrderTemplate|null>();
  const [ templates, setTemplates ] = useState<OrderTemplate[]>([]);
  const date = useWatch({ control, name: "date" });

  useEffect(() => {
    if(isWeekend(date)){
      if(isSaturday(date)){
        setTemplates(getOrderTemplates().saturday);
      }
      if(isSunday(date)){
        setTemplates(getOrderTemplates().sunday);
      }
    }
    if(!isWeekend(date)){
      if(isFriday(date)){
        setTemplates(getOrderTemplates().friday);
      }else{
        setTemplates(getOrderTemplates().business_day);
      }
    }
  }, [date]);
  const filterOptions = createFilterOptions({
    stringify: (option: OrderTemplate) => `${option.ship} ${option.time} ${option.port}`,
  });

  useEffect( () => {
    setValue("ship", template?.ship ? template.ship:"");
    setValue("time", template?.time ? parse(template?.time, "HH:mm", new Date()):new Date());
    setValue("port", template?.port ? template.port:"");
    setValue("dock", template?.dock ? template.dock:"");
    setValue("event", template?.event ? template.event:"");
    setValue("services", template?.services ? template.services:[]);
  }, [template, setValue]);

  return (
    <Autocomplete
      filterOptions={filterOptions}
      sx={{ maxWidth: 200 }}
      options={templates}
      selectOnFocus
      onChange={(e,value) => setTemplate(value)}
      groupBy={(option: OrderTemplate) => option.port}
      getOptionLabel={(option: OrderTemplate) => `${option.ship} ${option.time}`}
      renderInput={(params) => <TextField label={label? label: "Templates"} variant="standard" {...params} inputRef={ref} />}
    />
  );
});
TemplateSelect.displayName = "TemplateSelect";
export default TemplateSelect;
