import React, { useState, useEffect } from "react";
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  Box,
  Divider,
  Paper,
  ListItemText,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Caixa = () => {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setcliente] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState({});
  const [filtroNome, setFiltroNome] = useState("");
  const [Quantidade, setQuantidade] = useState(0);
  const [dataToInsert, setDataToInsert] = useState({
    situacao: "",
    pagamento: "",
    combo: "",
  });
  const [selectedClient, setSelectedClient] = useState("");

  const clearForm = () => {
    setDataToInsert({
      situacao: "",
      pagamento: "",
      combo: "",
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://lalitaapi.onrender.com/Produtos");
        if (!response.ok) throw new Error("Erro ao buscar produtos");
        const data = await response.json();
        // Converte o objeto de produtos em um array
        const productsArray = Object.keys(data).map((key) => ({
          productid: key,
          ...data[key],
        }));

        setProdutos(productsArray);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        toast.error("Erro ao buscar dados.");
      }
    };
    fetchProducts();

    const fetchClients = async () => {
      try {
        const response = await fetch("https://lalitaapi.onrender.com/Clientes");
        if (!response.ok) throw new Error("Erro ao buscar Clientes");
        const data = await response.json();
        // Converte o objeto de produtos em um array
        const ClientsArray = Object.keys(data).map((key) => ({
          clientid: key,
          ...data[key],
        }));

        setcliente(ClientsArray);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        toast.error("Erro ao buscar dados.");
      }
    };
    fetchClients();
  }, []);

  const finalizarCompra = async () => {
    const items = carrinho.map((item) => ({
      productid: Number(item.produto.productid),
      nome: item.produto.nome,
      descricao: item.produto.descricao,
      preco: Number(item.produto.preco), // Converte para número
      precovenda: Number(item.produto.precovenda), // Converte para número
      quantidade: Number(item.quantidade),
    }));

    const totalPrice = calcularTotal();
    if (carrinho.length === 0) {
      toast.error("Selecione um produto antes de finalizar a compra");
      return;
    }
    if (!selectedClient) {
      toast.error("Selecione um cliente antes de finalizar a compra");
      return;
    }
    if (!dataToInsert.pagamento) {
      toast.error(
        "Selecione uma forma de pagamento antes de finalizar a compra"
      );
      return;
    }
    if (!dataToInsert.situacao) {
      toast.error("Selecione uma situação antes de finalizar a compra");
      return;
    }

    console.log(items);
    const productIds = items.map((item) => item.productid);
    console.log(totalPrice);
    console.log({
      totalprice: totalPrice,
      pagamento: dataToInsert.pagamento,
      situacao: dataToInsert.situacao,
      combo: dataToInsert.combo,
      productids: productIds,
      clienteid: selectedClient,
      items: items,
    });

    toast.success("Compra finalizada com Sucesso");
    const response = await fetch("https://lalitaapi.onrender.com/Vendas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalprice: totalPrice,
        pagamento: dataToInsert.pagamento,
        situacao: dataToInsert.situacao,
        combo: dataToInsert.combo,
        productids: productIds,
        clientid: selectedClient,
        items: items,
      }),
    });
    console.log(response);
    if (response.ok) {
      try {
        const data = await response.json();
        console.log("Venda finalizada com sucesso:", data);
        atualizarQuantidadeProdutos();
        toast.success("Venda Realizada Com Sucesso!!");
        // Limpar carrinho após finalizar a venda
        setCarrinho([]);
        // Habilitar todos os produtos novamente
        setProdutosSelecionados({});
        clearForm();
        console.log(selectedClient);
      } catch (error) {
        console.error("Erro ao finalizar a venda:", error);
      }
    }
  };

  const atualizarQuantidadeProdutos = async () => {
    console.table(carrinho);
    for (const item of carrinho) {
      const productid = item.produto.productid;
      const quantidadeVendida = item.quantidade;
      const novaQuantidade =
        Number(item.produto.quantidade) - quantidadeVendida;
      console.log(productid);
      console.log(quantidadeVendida);
      console.log(novaQuantidade);
      console.log(item.produto.nome);
      console.log(item.produto.preco);
      console.log(item.produto.precovenda);
      console.log(item.produto.descricao);
      try {
        if (novaQuantidade <= 0) {
          const deleteResponse = await fetch(
            `https://lalitaapi.onrender.com/Produtos/${productid}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!deleteResponse.ok) throw new Error("Erro ao deletar produto");
          console.log(`Produto ${productid} deletado com sucesso`);
          toast.success(`Produto ${item.produto.nome} deletado com sucesso!`);
        } else {
          const updateResponse = await fetch(
            `https://lalitaapi.onrender.com/Produtos/${productid}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nome: item.produto.nome,
                descricao: item.produto.descricao,
                preco: item.produto.preco,
                precovenda: item.produto.precovenda,
                precocombo: item.produto.precocombo,
                quantidade: novaQuantidade,
              }),
            }
          );

          if (!updateResponse.ok) throw new Error("Erro ao atualizar produto");
          console.log(`Produto ${productid} atualizado com sucesso`);
          toast.success(`Produto ${item.produto.nome} atualizado com sucesso!`);
        }
      } catch (error) {
        console.error("Erro ao atualizar quantidade de produtos:", error);
        toast.error("Erro ao atualizar produtos.");
      }
    }
  };

  const handleChange = (e) => {
    setDataToInsert({
      ...dataToInsert,
      [e.target.name]: e.target.value,
    });
  };

  const adicionarAoCarrinho = (produto, quantidade) => {
    const itemExistente = carrinho.find(
      (item) => item.produto.productid === produto.productid
    );
    if (itemExistente) {
      const novoCarrinho = carrinho.map((item) =>
        item.produto.productid === produto.productid
          ? { ...item, quantidade: item.quantidade + quantidade }
          : item
      );
      setCarrinho(novoCarrinho);
      toast.success("item atualizado com sucesso");
    } else {
      setCarrinho([...carrinho, { produto, quantidade }]);
      toast.dark("item adicionado com sucesso");
      console.log(carrinho);
    }
    // Atualizar produtos selecionados
    const novoProdutosSelecionados = { ...produtosSelecionados };
    if (quantidade >= produto.Quantidade) {
      novoProdutosSelecionados[produto.productid] = true;
    } else {
      delete novoProdutosSelecionados[produto.productid];
    }
    setProdutosSelecionados(novoProdutosSelecionados);
  };

  const removerDoCarrinho = (produtoId) => {
    const novoCarrinho = carrinho.filter(
      (item) => item.produto.productid !== produtoId
    );
    setCarrinho(novoCarrinho);
    // Habilitar produto novamente
    const novoProdutosSelecionados = { ...produtosSelecionados };
    delete novoProdutosSelecionados[produtoId];
    setProdutosSelecionados(novoProdutosSelecionados);
    toast.info("excluido com sucesso");
  };

  const calcularTotal = () => {
    let total = 0;
    carrinho.forEach((item) => {
      const preco = dataToInsert.combo === "combo" 
        ? parseFloat(item.produto.precocombo) 
        : parseFloat(item.produto.precovenda);
  
      // Para combos, não aplica desconto
      if (dataToInsert.combo === "combo") {
        total += preco * item.quantidade; // Preço normal para combo
      } else {
        // Aplicar desconto de 6% para pagamentos em PIX ou dinheiro
        if (dataToInsert.pagamento === "pix" || dataToInsert.pagamento === "dinheiro") {
          total += preco * item.quantidade * 0.94; // 6% de desconto
        } else {
          total += preco * item.quantidade; // Preço normal para outros pagamentos
        }
      }
    });
  
    return total;
  };

  const filtrarProdutos = () => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
  };

  const handleClientChange = (event) => {
    console.log(event.target.value);
    console.table(cliente);
    setSelectedClient(event.target.value);
  };

  return (
    <>
      <Container
        style={{
          marginLeft: "5px",
          backgroundColor: "#fff",
          minHeight: "100vh",
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#f5d6a8",
                color: "black",
                marginTop: "10px",
              }}
            >
              <Typography variant="h5" color={"#c0844a"}>
                Lista de Produtos
              </Typography>
              <TextField
                label="Filtrar por nome"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                fullWidth
                margin="normal"
                style={{ color: "#c0844a" }}
              />
              <List>
                {filtrarProdutos().map((produto) => (
                  <ListItem key={produto.productid}>
                    <ListItemText
                      secondaryTypographyProps={{ style: { color: "black" } }}
                      primaryTypographyProps={{ style: { color: "black" } }}
                      primary={
                        <Typography>
                          {produto.productid} - {produto.nome}
                        </Typography>
                      }
                      secondary={
                        <Typography>
                          {`R$ ${produto.precovenda}`} - {`R$ ${produto.precocombo}`}
                        </Typography>
                      }
                    />
                    <Select
                      label="Quantidade"
                      value={Quantidade}
                      onChange={(event) => setQuantidade(event.target.value)}
                      disabled={produtosSelecionados[produto.productid]}
                      style={{ color: "black" }}
                    >
                      {[...Array(parseInt(produto.quantidade)).keys()].map(
                        (q) => (
                          <MenuItem
                            style={{ color: "black" }}
                            key={q + 1}
                            value={q + 1}
                          >
                            {q + 1}
                          </MenuItem>
                        )
                      )}
                    </Select>
                    <IconButton
                      onClick={() => adicionarAoCarrinho(produto, Quantidade)}
                      edge="end"
                      aria-label="Adicionar"
                    >
                      <AddIcon style={{ color: "black" }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#f5d6a8",
                color: "black",
                marginTop: "10px",
              }}
            >
              <Typography variant="h5" style={{ color: "black" }}>
                Carrinho
              </Typography>
              <List>
                {carrinho.map((item) => (
                  <div key={item.produto.productid}>
                    <ListItem>
                      <ListItemText
                        secondaryTypographyProps={{ style: { color: "black" } }}
                        primaryTypographyProps={{ style: { color: "black" } }}
                        primary={item.produto.nome}
                        secondary={`Quantidade: ${item.quantidade}`}
                      />
                      <ListItemText
                        primaryTypographyProps={{ style: { color: "black" } }}
                        primary={`Total: R$ ${
                          parseFloat(item.produto.precovenda) * item.quantidade
                        }`}
                      />
                      <IconButton
                        onClick={() =>
                          removerDoCarrinho(item.produto.productid)
                        }
                        edge="end"
                        aria-label="remover"
                      >
                        <DeleteIcon style={{ color: "black" }} />
                      </IconButton>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
              <Box mt={2}>
                <Typography style={{ color: "#c0844a" }} variant="subtitle1">
                  Valor Total R$ {calcularTotal().toFixed(2)}
                </Typography>
  
                <label style={{ color: "#c0844a" }}>
                  Selecione o Cliente
                  <Select
                    value={selectedClient}
                    onChange={handleClientChange}
                    style={{ color: "#c0844a" }}
                  >
                    <MenuItem value="" style={{ color: "#c0844a" }}>
                      Selecione um cliente...
                    </MenuItem>
                    {cliente.map((cliente) => (
                      <MenuItem
                        style={{ color: "#c0844a" }}
                        key={cliente.clientid}
                        value={cliente.clientid}
                      >
                        {cliente.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </label>
                <RadioGroup
                  name="combo"
                  value={dataToInsert.combo}
                  onChange={handleChange}
                  row
                  style={{ color: "#c0844a" }}
                >
                  <FormControlLabel
                    value="combo"
                    control={<Radio />}
                    label="COMBO"
                   
                  />
                  <FormControlLabel
                    value="naocombo"
                    control={<Radio />}
                    label="NÃO COMBO"
                    
                  />
                </RadioGroup>
                <RadioGroup
                  name="pagamento"
                  value={dataToInsert.pagamento}
                  onChange={handleChange}
                  row
                  style={{ color: "#c0844a" }}
                >
                  <FormControlLabel
                    value="pix"
                    control={<Radio />}
                    label="PIX"
                  />
                  <FormControlLabel
                    value="dinheiro"
                    control={<Radio />}
                    label="DINHEIRO"
                  />
                  <FormControlLabel
                    value="cartaodecredito"
                    control={<Radio />}
                    label="CARTÃO DE CREDITO"
                  />
                </RadioGroup>
                <RadioGroup
                  name="situacao"
                  value={dataToInsert.situacao}
                  onChange={handleChange}
                  row
                  style={{ color: "#c0844a" }}
                >
                  <FormControlLabel
                    value="Pendente"
                    control={<Radio />}
                    label="Pendente"
                  />
                  <FormControlLabel
                    value="Concluída"
                    control={<Radio />}
                    label="Concluída"
                  />
                </RadioGroup>
                <div>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#c0844a",
                      color: "$c7c7c6",
                      marginRight: "8px",
                    }}
                    onClick={finalizarCompra}
                    startIcon={<ShoppingCartIcon />}
                  >
                    Finalizar Compra
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#616161", color: "#ffffff" }}
                    onClick={() => setCarrinho([])}
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer />
    </>
  );
};

export default Caixa;
