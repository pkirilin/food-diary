import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { type FC } from 'react';

export const MissingNutritionValuesIndicator: FC = () => (
  <ReportProblemOutlinedIcon
    color="warning"
    titleAccess="Nutrition values are missing"
    sx={{ fontSize: 16 }}
  />
);
