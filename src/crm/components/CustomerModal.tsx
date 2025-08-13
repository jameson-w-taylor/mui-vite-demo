import * as React from 'react';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { usersApi, User, CreateUserRequest, UpdateUserRequest } from '../services/usersApi';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

const titleOptions = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];
const genderOptions = ['male', 'female', 'other'];

export default function CustomerModal({ open, onClose, user, onSuccess }: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    title: 'Mr',
    firstName: '',
    lastName: '',
    gender: 'male',
    streetNumber: '',
    streetName: '',
    city: '',
    state: '',
    country: '',
    postcode: '',
    phone: '',
    cell: '',
  });

  const isEdit = Boolean(user);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.login.username || '',
        password: '', // Don't show password for security
        title: user.name.title || 'Mr',
        firstName: user.name.first || '',
        lastName: user.name.last || '',
        gender: user.gender || 'male',
        streetNumber: user.location.street.number?.toString() || '',
        streetName: user.location.street.name || '',
        city: user.location.city || '',
        state: user.location.state || '',
        country: user.location.country || '',
        postcode: user.location.postcode || '',
        phone: user.phone || '',
        cell: user.cell || '',
      });
    } else {
      // Reset form for new user
      setFormData({
        email: '',
        username: '',
        password: '',
        title: 'Mr',
        firstName: '',
        lastName: '',
        gender: 'male',
        streetNumber: '',
        streetName: '',
        city: '',
        state: '',
        country: '',
        postcode: '',
        phone: '',
        cell: '',
      });
    }
    setError(null);
  }, [user, open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && user) {
        // Update user
        const updateData: UpdateUserRequest = {
          email: formData.email,
          name: {
            first: formData.firstName,
            last: formData.lastName,
            title: formData.title,
          },
          gender: formData.gender,
          location: {
            street: {
              number: formData.streetNumber ? parseInt(formData.streetNumber, 10) : undefined,
              name: formData.streetName,
            },
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postcode: formData.postcode,
          },
          phone: formData.phone,
          cell: formData.cell,
        };

        await usersApi.updateUser(user.login.uuid, updateData);
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          email: formData.email,
          login: {
            username: formData.username,
            password: formData.password,
          },
          name: {
            first: formData.firstName,
            last: formData.lastName,
            title: formData.title,
          },
          gender: formData.gender,
          location: {
            street: {
              number: formData.streetNumber ? parseInt(formData.streetNumber, 10) : undefined,
              name: formData.streetName,
            },
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postcode: formData.postcode,
          },
        };

        await usersApi.createUser(createData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isEdit && user && (
            <Avatar
              src={user.picture.thumbnail}
              alt={`${user.name.first} ${user.name.last}`}
              sx={{ width: 40, height: 40 }}
            />
          )}
          <Typography variant="h6">
            {isEdit ? 'Modify Customer' : 'Add New Customer'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                disabled={loading}
              />
            </Grid>

            {!isEdit && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleChange('username')}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.title}
                  label="Title"
                  onChange={handleChange('title')}
                  disabled={loading}
                >
                  {titleOptions.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange('gender')}
                  disabled={loading}
                >
                  {genderOptions.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 'bold' }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Street Number"
                type="number"
                value={formData.streetNumber}
                onChange={handleChange('streetNumber')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Street Name"
                value={formData.streetName}
                onChange={handleChange('streetName')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postcode}
                onChange={handleChange('postcode')}
                disabled={loading}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 'bold' }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell Phone"
                value={formData.cell}
                onChange={handleChange('cell')}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.email || !formData.firstName || !formData.lastName || (!isEdit && (!formData.username || !formData.password))}
        >
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
