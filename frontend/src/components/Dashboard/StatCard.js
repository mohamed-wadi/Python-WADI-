import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `4px solid ${color}`,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ flexGrow: 1, padding: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
            >
              {title}
            </Typography>
            <Box sx={{ color }}>
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard; 