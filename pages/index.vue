<template>
  <div class="container">
    <div>
      <transition-group name="p-messages" tag="div">
        <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
      </transition-group>
      <h1>Добро пожаловать на портал Ассистент</h1>
      <p>Назанчение данного портала - помочь в работе нашим клиентам</p>
      <p>-------------------------------------------------------------------</p>  
    <Button label="Войти" @click="Link()"/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
    };
  },
  async mounted() {
    const UserAuthID = localStorage.getItem("UserAuthID");
    const config = { params: { UserAuthID } };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
  },
  methods: {
    Link() {
      return this.$router.push("/modules");
    },
  },
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
