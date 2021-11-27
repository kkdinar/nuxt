<template>
  <div>
    <Toolbar>
      <template #left>
        <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
        <i class="pi pi-bars p-toolbar-separator p-mr-2" />
        <Button label="Сохранить" icon="pi pi-save" @click="clickSave()" class="p-button-success"/>
      </template>
    </Toolbar>
    <transition-group name="p-messages" tag="div">
      <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
    </transition-group>
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-grid">
          <label for="name" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Наименование</label>
          <div class="p-col-12 p-md-10">
            <InputText id="name" type="text" v-model="FormData.DocMovement.Name"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="description" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Описание</label>
          <div class="p-col-12 p-md-10">          
            <Textarea id="description" v-model="FormData.DocMovement.Description" :autoResize="true" rows="5" cols="30" />
          </div>
      </div> 
    </div> 
    <div>
      <label>----------</label>
    </div>
    <Toolbar class="p-mb-4">
      <template #left>
        <Button label="Создать" icon="pi pi-plus" class="p-button-success p-mr-2" @click="newRow" />
        <Button label="Удалить" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedRow" :disabled="!selectedRows || !selectedRows.length" />
      </template>
    </Toolbar>
    <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" editMode="cell" class="p-datatable-gridlines">
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
      <Column field="id" header="Код" headerStyle="width: 5em"></Column>
      <Column field="Name" header="Наименование">
            <template #editor="slotProps">
                <InputText v-model="slotProps.data[slotProps.column.field]" />
            </template>
      </Column>
      <Column field="DateBegin" header="Дата начала">
        <template #editor="slotProps">
          <Calendar v-model="slotProps.data['DateBegin']" :locale="Ru" :showIcon="true" dateFormat="dd.mm.yy"/>
        </template>
        <template #body="slotProps">
          {{getColumnDate(slotProps.data.DateBegin)}}
        </template>
      </Column>
      <Column field="DateEnd" header="Дата окончания">
        <template #editor="slotProps">
          <Calendar v-model="slotProps.data['DateEnd']" :locale="Ru" :showIcon="true" dateFormat="dd.mm.yy"/>
        </template>
        <template #body="slotProps">
          {{getColumnDate(slotProps.data.DateEnd)}}
        </template>
      </Column>
    </DataTable>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      FormData: {
        DocMovement: {},
        Entity: [],
      },
      messages: [],
      selectedRows: null,
      Ru: {
        firstDayOfWeek: 0,
        dayNames: [
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота",
          "Воскресенье",
        ],
        dayNamesShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        dayNamesMin: ["П", "В", "С", "Ч", "П", "С", "В"],
        monthNames: [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ],
        monthNamesShort: [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Нояб",
          "Дек",
        ],
        today: "Сегодня",
        clear: "Очистить",
        //weekHeader: "Sm",
        dateFormat: "dd.mm.yy",
      },
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "dictionary",
        form: "DictionaryForm",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else {
      this.FormData = answer;
    }
  },
  methods: {
    getColumnDate(d) {
      if (!d) return "";
      const date = new Date(d);
      let month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      return date.getDate() + "." + month + "." + date.getFullYear();
    },
    clickExit() {
      this.$router.push("/modules/dictionary");
    },
    async clickSave() {
      const formData = {
        module: "dictionary",
        form: "DictionaryForm",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", this.$data.FormData);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else
        this.$data.messages = [
          { severity: "success", content: "Документ сохранён" },
        ];
    },
    async newRow() {
      //this.$data.FormData.Entity.push({});
      const formData = {
        module: "dictionary",
        form: "DictionaryForm",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: {
          Entity: [
            {
              Parent: this.$data.FormData.DocMovement.id,
            },
          ],
        },
      };
      //console.log("formData=", formData);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else this.$data.FormData.Entity.push(answer.Entity);
    },
    async deleteSelectedRow() {
      //console.log("selectedRows=", this.$data.selectedRows);
      const formData = {
        data: {
          module: "dictionary",
          form: "DictionaryForm",
          data: {
            Entity: this.$data.selectedRows,
          },
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      const answer = await this.$axios.$delete("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        const newTable = [];
        this.$data.FormData.Entity.forEach((row) => {
          if (!this.$data.selectedRows.some((r) => row.id == r.id))
            newTable.push(row);
        });
        this.$data.FormData.Entity = newTable;
        this.$data.selectedRows = [];
      }
    },
  },
};
</script>
