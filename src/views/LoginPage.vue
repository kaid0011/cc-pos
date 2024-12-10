<template>
  <div class="login-container">
    <q-card class="q-pa-lg login-card q-py-md q-px-lg">
      <!-- Add Image Above POS Login -->
      <div class="flex flex-center">
        <q-img
          src="@/assets/images/orange_logo.png"
          alt="POS Logo"
          style="max-width: 150px; max-height: 150px"
        />
      </div>

      <div class="text-h5 text-center text-weight-bold q-mb-md">POS Login</div>
      <q-form @submit="login">
        <q-input
          filled
          v-model="email"
          type="email"
          label="Email"
          required
          class="q-mb-md"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="password"
          type="password"
          label="Password"
          required
          class="q-mb-md"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-btn
          label="Login"
          color="primary"
          type="submit"
          :loading="loading"
          unelevated
          class="full-width"
        />

        <q-banner v-if="error" type="negative" class="q-mt-md text-center">
          <q-icon name="warning" size="md" class="q-mr-sm" />
          {{ error }}
        </q-banner>
      </q-form>
    </q-card>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; // Import useRouter for redirection
import { useAuth } from "@/../supabase/api/auth"; // Adjusted the path to the correct structure

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const router = useRouter(); // Initialize router for navigation

const { loginUser } = useAuth();

const login = async () => {
  loading.value = true;
  error.value = "";

  // Handle login
  const { user, loginError } = await loginUser(email.value, password.value);

  if (loginError) {
    error.value = loginError.message;
  } else {
    console.log("Logged in successfully!", user);
    router.push("/pos"); // Redirect to /dashboard after successful login
  }

  loading.value = false;
};
</script>
