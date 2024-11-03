import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [SelectedaddSales, setSelectedaddSales] = useState(null);
  const [ItensSales, setItensSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [Vendaid, setVendaid] = useState(null);
  const [valorrestante, setValorrestante] = useState(null);
  const [dataToInsert, setDataToInsert] = useState({
    Valorrecebido: "",
  });
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filterloading, setFilterloading] = useState(false);
  useEffect(() => {
    fetchSales();
  }, []);

  const handleChange = (e) => {
    setDataToInsert({
      ...dataToInsert,
      [e.target.name]: e.target.value,
    });
  };
  console.log(dataToInsert);

  const handlePagamento = async (sales) => {

    const valorNumerico = parseFloat(dataToInsert.Valorrecebido);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("digite numero valido");
      return;
    }
    if (valorNumerico > valorrestante) {
      toast.error(`digite valor ate ${valorrestante}`);
      return;
    }
    
    if (valorrestante === 0) {
      fetch(`https://lalitaapi.onrender.com/Vendas/${Vendaid}`, {
        method: "PUT",
        body: JSON.stringify({
          situacao: "Concluida",
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then(() => {
          toast.success("Venda Atualizada com sucesso");
          fetchSales();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    const vendaid = sales.Vendaid;
    const Vendaid = sales.Vendaid;
    try {
      const response = await fetch(
        `https://lalitaapi.onrender.com/Vendas/pagamentos/${vendaid}`,
        {
          method: "POST",
          body: JSON.stringify(dataToInsert),
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response);
      if (response.ok) {
        toast.success("Pagamento cadastrado com sucesso");
        clearForm();
        const valorrestante = await calculartotal(sales);
        if(valorrestante === 0){
          fetch(`https://lalitaapi.onrender.com/Vendas/${Vendaid}`, {
            method: "PUT",
            body: JSON.stringify({
              situacao: "Concluida",
            }),
            headers: { "Content-Type": "application/json" },
          })
            .then(() => {
              toast.success("Venda Atualizada com sucesso");
              fetchSales();
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }
        setValorrestante(valorrestante);
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao cadastrar Pagamento: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar produto.");
    }
  };

  const clearForm = () => {
    setDataToInsert({
      Valorrecebido: "",
      valorrestante: "",
    });
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
  };


  const fetchSales = () => {
    fetch("https://lalitaapi.onrender.com/Vendas")
      .then((res) => res.json())
      .then((data) => {
        // Converte o objeto de produtos em um array
        const vendasArray = Object.keys(data).map((key) => ({
          Vendaid: key,
          ...data[key],
        }));
        setSales(vendasArray);
        setFilteredSales(vendasArray); // Ao buscar as vendas, inicialmente exibir todas
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao buscar vendas.");
      });
  };

  const fetchpagamentos = async (sales) => {
    const vendaid = sales.Vendaid;
    try {
      const response = await fetch(
        `https://lalitaapi.onrender.com/Vendas/pagamentos/${vendaid}`
      );
      const data = await response.json();
       // Converte o objeto de produtos em um array
       const vendasArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      console.log(vendasArray);// Verifique o que está sendo retornado aqui
      return vendasArray; // Agora retornamos apenas o telefone como string
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar vendas.");
      return {}; // Retorne null em caso de erro
    }
  };

  const calculartotal = async (sales) => {
    const pagamentos = await fetchpagamentos(sales);
    const valorvenda = sales.totalprice;
  
    // Converte `Valorrecebido` para número e soma
    const totalRecebido = pagamentos.reduce((total, pagamento) => {
      const valor = parseFloat(pagamento.Valorrecebido);
      return total + (isNaN(valor) ? 0 : valor); // Ignora valores não numéricos
    }, 0);
  
    // Calcula o valor restante subtraindo o total recebido do valor da venda
    const restante = valorvenda - totalRecebido;
  
   return restante; // Retorna o valor restante
  };
  
  

  const phone = async (Clientid) => {
    const clientid = encodeURIComponent(Clientid);
    try {
      const response = await fetch(
        `https://lalitaapi.onrender.com/Clientes/phone/${clientid}`
      );
      const data = await response.json();
      console.log(data); // Verifique o que está sendo retornado aqui
      return data.phone; // Agora retornamos apenas o telefone como string
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar vendas.");
      return {}; // Retorne null em caso de erro
    }
  };

  async function enviarComprovanteWhatsApp(sales) {
    // Criar a mensagem profissional
    const itensLista = ItensSales.map(
      (item) =>
        `${item.nome}.\n
      (R$ ${item.precovenda}).\n 
      ${item.descricao}.\n 
      ${item.quantidade}.`
    ); // Formata os itens

    const comprovanteVenda = 
  `*COMPROVANTE DE VENDA*. \n\n` +
  `Cliente: ${sales.clientid}.\n` +
  `Data: ${sales.createdAt ? new Date(sales.createdAt).toLocaleDateString() : "Data inválida"}.\n\n` +
  `*Itens Comprados:*\n${itensLista}. \n\n` +
  `Total: R$ ${sales.totalprice}. \n` +
  `Pagamento: ${sales.pagamento}. \n\n` +
  `Obrigado pela sua compra!\n\n` +
  `*Nome da Empresa*. \n` +
  `*Telefone: (xx) xxxx-xxxx*. \n` +
  `*E-mail: contato@suaempresa.com*`;


    const telefone = await phone(sales.clientid);

    // Verifique se o telefone foi encontrado antes de prosseguir
    if (!telefone) {
      console.error("Telefone não encontrado.");
      return; // Interrompe a função se o telefone não foi encontrado
    }

    console.log(telefone);
    console.log(sales);
    console.log(itensLista);

    // Codificar a mensagem para URL
    const mensagemCodificada = encodeURIComponent(comprovanteVenda);

    // Criar o link do WhatsApp
    const numeroComDdi = `55${telefone}`; // Adiciona DDI do Brasil se necessário
    const linkWhatsApp = `https://wa.me/${numeroComDdi}?text=${mensagemCodificada}`;

    // Abrir o link no WhatsApp
    window.open(linkWhatsApp, "_blank");
  }

  const updateSaleStatus = (sale) => {
    setVendaid(sale.Vendaid);
    setSelectedaddSales(sale)
    setOpenUpdateDialog(true);
  };

  const handleUpdateConfirmed = () => {
    setOpenUpdateDialog(false);
    fetch(`https://lalitaapi.onrender.com/Vendas/${Vendaid}`, {
      method: "PUT",
      body: JSON.stringify({
        situacao: "Concluida",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => {
        toast.success("Venda Atualizada com sucesso");
        fetchSales();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleDelete = (id) => {
    setVendaid(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmed = () => {
    setOpenDeleteDialog(false);
    fetch(`https://lalitaapi.onrender.com/Vendas/${Vendaid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then(() => {
        toast.success("Venda excluída com sucesso");
        fetchSales();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchSaleItems = async (Vendaid) => {
    try {
      const response = await fetch(
        `https://lalitaapi.onrender.com/Vendas/itens/${Vendaid}`
      );
      const data = await response.json();
      // Converte o objeto de produtos em um array
      const ItensArray = Object.keys(data).map((key) => ({
        itemId: key,
        ...data[key],
      }));

      return ItensArray;
    } catch (error) {
      console.error("Erro ao obter itens da venda:", error);
      throw error;
    }
  };

  const toggleSaleDetails = async (sale) => {
    if (selectedSale === sale) {
      setSelectedSale(null);
    } else {
      try {
        const saleItems = await fetchSaleItems(sale.Vendaid);
        const valorrestante = await calculartotal(sale);
        setValorrestante(valorrestante);
        setItensSales(saleItems);
        setSelectedSale(sale);
      } catch (error) {
        console.error("Erro ao buscar itens da venda:", error);
        toast.error("Erro ao buscar itens da venda.");
      }
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      const filtered = sales.filter((sale) => {
        const saleDate = new Date(sale.data_venda);
        return saleDate >= startDate && saleDate <= endDate;
      });
      setFilteredSales(filtered);
      setFilterloading(true);
    } else {
      setFilteredSales(sales); // Se nenhuma data selecionada, exibir todas as vendas
    }
  };

  const clearFilter = () => {
    setFilterloading(false);
    setStartDate(null);
    setEndDate(null);
    setFilteredSales(sales); // Atualiza para mostrar todas as vendas novamente
  };

  return (
    <>
      <Grid
        container
        justifyContent="center"
        style={{
          minHeight: "100vh",
          marginTop: "0px",
          backgroundColor: "#fff",
          color: "#f5d6a8",
        }}
      >
        <Grid item xs={12} md={10} lg={8}>
          <h1 style={{ textAlign: "center" }}>Lista de Vendas</h1>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ flexDirection: "column", textAlign: "center" }}
          >
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1">De:</Typography>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="dd/MM/yyyy"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1">Até:</Typography>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                dateFormat="dd/MM/yyyy"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                style={{ color: "#fff", backgroundColor: "#f5d6a8" }}
                onClick={handleFilter}
              >
                Filtrar
              </Button>
              {filterloading && (
                <IconButton aria-label="excluir" onClick={clearFilter}>
                  <Typography variant="body1">Desfazer Filtragem</Typography>
                  <DeleteIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table aria-label="vendas">
              <TableHead>
                <TableRow>
                  <TableCell>Venda</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.map((sale) => (
                  <React.Fragment key={sale.Vendaid}>
                    <TableRow>
                      <TableCell>{sale.Vendaid}</TableCell>
                      <TableCell>
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString()
                          : "Data inválida"}
                      </TableCell>
                      <TableCell>
                        R$ {parseFloat(sale.totalprice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="ver detalhes"
                          onClick={() => toggleSaleDetails(sale)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton aria-label="editar">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="excluir"
                          onClick={() => handleDelete(sale.Vendaid)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {selectedSale === sale && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <h3>Detalhes da Venda:</h3>
                          <ul>
                            {ItensSales.map((item) => (
                              <li key={item.itemId}>
                                <p>Produto: {item.nome}</p>
                                <p>Descrição: {item.descricao}</p>
                                <p>
                                  Preço Unitário: R${" "}
                                  {parseFloat(item.precovenda)}
                                </p>
                                <p>Quantidade: {item.quantidade}</p>
                              </li>
                            ))}
                            <li>
                              <p>Pagamento: {sale.pagamento}</p>
                              <p>Situação: {sale.situacao}</p>
                              <p>Cliente: {sale.clientid}</p>
                              <p>Combo: {sale.combo}</p>
                              {sale.situacao === "Pendente" && (
                                <>
                                  <p>Valorr Restante: {valorrestante}</p>

                                  <TextField
                                    name="Valorrecebido"
                                    label="Valor"
                                    value={dataToInsert.Valorrecebido}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                  />

                                  <IconButton
                                    onClick={() => updateSaleStatus(sale)}
                                  >
                                    <DoneIcon />
                                  </IconButton>
                                </>
                              )}
                              {
                                <IconButton
                                  aria-label="baixarr"
                                  onClick={() =>
                                    enviarComprovanteWhatsApp(sale)
                                  }
                                >
                                  <SendIcon />
                                </IconButton>
                              }
                            </li>
                          </ul>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Excluir Venda</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir esta venda?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteConfirmed}
                color="secondary"
                autoFocus
              >
                Excluir
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog}>
            <DialogTitle>Atualizar Venda</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja Atualizar/Realizar esse Pagamento?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUpdateDialog} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={handlePagamento(SelectedaddSales)}
                color="secondary"
                autoFocus
              >
                Atualizar/Pagamento
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
}

export default SalesPage;