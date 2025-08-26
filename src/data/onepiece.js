const onepiece = [
  {
    id: 1,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwqlRuUNyq-r6TwJiQVuJvjqC99pLXMVtENOnsnov4xwM11wGFEZU_XradtWRn9XBtznLiymI_YyFu2LrEWJohB63MjueNTYBd4RPzfs2DFL5-7CUXhKGr-0j2QcN7jydCHTw",
    episode: 1
  },
  {
    id: 2,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxR4ZArXzkfNfRXM2utnBfbmY8aTEze1Td0amN_c-rqJQo429Z9mhjoI-qg-lpFN4KJsowDTscSZtsEgd7vAzw9lkxzPAN5ZeimCoFm2AoUeYsSVm4sQ03O-EvWQRooXheMZ-Ld",
    episode: 2
  },
  {
    id: 3,
    src: "https://draft.blogger.com/video.g?token=AD6v5dyJ7GLeN03t9ZyewsN6Nyfzli88oeV4Pr9YQD8k_M14oBXSDyxuudjvY28htisqxkmoExFCPvVinH9L6Q9g5zZdeJIT-oXa_L4LUy1SogfrEukNzPOIetnwnXMUBjD8b0-IsBHr",
    episode: 3
  },
  {
    id: 4,
    src: "https://draft.blogger.com/video.g?token=AD6v5dypf-isxW9GVIG8yYoD0RfvnTAXWZl90-Qitv54JuYCOo4Swsuz7FOG0-t2IALIH7nPsj-3bIe0NGCqtXVr11NTIBuHPCGTfLVSmiUniRk7fI4CZNwA9oqHWHRGSEbVVc8WCCR_",
    episode: 4
  },
  {
    id: 5,
    src: "https://draft.blogger.com/video.g?token=AD6v5dz-GEPJIHijrNFTIVmzYc-SZ1mHNwKc4nCOlPkg5Vq1K4Ov0BbcHRUikrtMoRlOl7rAJHFF2Y4s_bMQg__kgqYlElXolcv_ufWHXo-YtvpzpnqoGWyf6zXVwEgDogl4Re7YeyA",
    episode: 5
  },
  {
    id: 6,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxWCmSGH-8iCimh1Q0hIxiY_9rs1JQFkaZifmDDde4iY4R0jJTIVpVWG8ol0FECJOd72_c9i66lJHvVHKTzvixFs2lyOHs8D6nV_25pyU7IlsgbnpT6JLSrmnwBsNkxutgfNO6w",
    episode: 6
  },
  {
    id: 7,
    src: "https://draft.blogger.com/video.g?token=AD6v5dynwl5tdqu5Z89vh7nL0dCj1wxTGRC8K1eTYpIQrqek55D1NvebSDdIWroa_lHEqTxfQqOKHTcjrvEWyHzWJbw-f61hkitF1a7lu_6vu_orUZ_3oIO2mL7ddOjGKfG3B7GVzyeo",
    episode: 7
  },
  {
    id: 8,
    src: "https://draft.blogger.com/video.g?token=AD6v5dywrFwhA2KxcJT8N0CrUg3mB2K3Knoxv_7b3iMnE_f7whLKs-QfJVxQ3GV2Bo9ARYTjxmN9iF6Ie1ycTrD-AxYDPXXvNxWpDLhQ3guuxWOcJKqw6rzRDv3E0HTArRndoSolZvJk",
    episode: 8
  },
  {
    id: 9,
    src: "https://draft.blogger.com/video.g?token=AD6v5dx0Mu6Xxp1HForG9L8A1okJMY6HgDNLVSwJ7TfjNehBzQmAnM4QTnkwmWSFgTVeukui4qo_tlRgstpzm6XQCOvdxfjxUJc7RVD50lsV7hv8Y4HwJ_VgeBVgflUN23F3np9yMw",
    episode: 9
  },
  {
    id: 10,
    src: "https://draft.blogger.com/video.g?token=AD6v5dx1oM49AKuMNYGJYKe9Gll-SbSmbLew51RL6AGMt20_7h9uTTqwKAmle7T0l-Df6DGEQ5ycmdFmxBUY349g49PUYl3PqP0yWVbKgkNQNwD5BIYxY2BWU3JsrFGx-YtpFGFT8MA",
    episode: 10
  },
  {
    id: 11,
    src: "https://draft.blogger.com/video.g?token=AD6v5dy338MDQ3gfSinQIvd7ZcQeIewd7LLPN5VXnf9p13-pDEqFBAP4IyvPdwMqYPfCsYnEQ8M9lOsAwnO1nTEmxm08hCL6yj5xLVM36K43QcpA3exEa0L_No4L6KmRie3awL9rRQ",
    episode: 11
  },
  {
    id: 12,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw9gGLqzUQm-LtiC5fi0rCGRNNk8NEUPUUliwa4ycu-o-JY6ZvTKZ7m63TI6owiGRMm-QHnb5-gZ0ODXqBczHC7rtQ2YTNrA0VJMtv60KGkWOc095_ud8TdXxch9kMkf5YxEu9z",
    episode: 12
  },
  {
    id: 13,
    src: "https://draft.blogger.com/video.g?token=AD6v5dx6EnFEzpYpozpQ46UM4OkNItGDs9qfPYPmq7u4BT89uR_RCwPq4ghI0SxZ_xI99xjfdvpHeaWFs1Iqb-e0C4b_LJwEkJiLCbjba9kAQVlbGQiOxzXlr0cdKEJTdK35so5god8",
    episode: 13
  },
  {
    id: 14,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw0SAvjLt90gKdVzYvdgGdePpITfGdyJjdgRvfFbsc5n_e10AhiZQSAAZnHq_ZHw7EnukcY8rnc8Bh63smsU6BzSYi07gHuW1EXmLUdMgapTmbyubPsC_v7XemwpeIVHZ9k83RN",
    episode: 14
  },
  {
    id: 15,
    src: "https://draft.blogger.com/video.g?token=AD6v5dymabNd8I2qqyQhT_MUHNiNiCUVrEG6bozo5Qa9PRHmQKTRVzy0UT7aifCEDjVtvFXRfQJnwuXmtBG4ohfIG2skjS2KCf3MDEtr75Gyy6UYN1PHweyB7iVKUYMczubgn0eBQZs",
    episode: 15
  },
  {
    id: 16,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzmP_JSPf63ClrM-rNw77t1olpwlJ-wAIBo_ZZJ3JdRB_btPYEvK-sxb2Xte_17idDc2ZugMo7GOXkI08-ZGPniiFvIBLSk8Fn-8rPKA5_skqedVnEpbZ4TrSMbhKUi75PH9oA",
    episode: 16
  },
  {
    id: 17,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwNxz1dhuBMowdf_9CRSWb1Z9y0jG55pGol_Pj0bcUdfrXFMZ08JmfOTErceAqYGUf4JMHoO-GS9yO90AcLDzu4vTt2qXsnI15WPCiCBEJ-mLsu0tdWlJWEA6gRDCPgM7dM5Q",
    episode: 17
  },
  {
    id: 18,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw76pncdtTFg5VVmFRJRVte2cu4UvTmE9RP5BNJyZls1vd-l7IRM7P6MA6lNFWAiULmpMIA9IiBuc0r1y2IsmgVPJPG-4v3ELhndSQ_gghKmdXsS3IEAYqsVnIJdkkASIX9GOrh",
    episode: 18
  },
  {
    id: 19,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwjjkC36wtDmypmbSD3lEw2lqTuHhpU6S8uyuJoAAYq9_S43o20RPEVSkRg5HJQdJ9pCY91kXGuK4axCruy_3nuAzjPzMBX0TYlPlEmmwSlZt3W_MRNtNgItosx65ecbug0njXG",
    episode: 19
  },
  {
    id: 20,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzfuGP-MoA6n72-pQ1ZTaRjNhqhXFJcK8Ta6zcirVOT1RUVxsqyQJxqWExapn93tlLtEYv5kiA99M8iFhf5nXWDZbFYnO9ckP1-kcKTKqqgBr7jmwh6jJjXUrOHvdoJYBqDLNk",
    episode: 20
  },
  {
    id: 21,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw039I9jb53pSoLuAbhsaKo3IxmRjHBvcMcT3KCYmTSQAVSzCB-S0GPggjwWQ6TmlIp5lVHjsFliFaqP4eSp8kVHZXsGDcqFHjsJvVIYdOoL-_mQSe7sAsbhVTpEsSDTtGbbv0h",
    episode: 21
  },
  {
    id: 22,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwIol9cN1K8S9L50SP10L_0Ii8xFZzH4VR0IcGzRfxQYLMir0BjU3nm0DY2fPBblYghF1Gn3jak9rlJ9sK4_TcVgsxkW5hD5cqkjHJpurgG1V9RNUUMWO-GiFhnmGfkQdaB0tn9",
    episode: 22
  },
  {
    id: 23,
    src: "https://draft.blogger.com/video.g?token=AD6v5dyuR2zn89tra9L1QCdu9elo1MjUyjwQYkr__Dn7i83jD2ppyTsB9QdMmfo8TcfUoc1WnF5TI2VQ96RqEXLqr6dqDyI6ExQx9X8PphaIECMzwslnreNU2-m84cf8Hcp94eI5XcOk",
    episode: 23
  },
  {
    id: 24,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxKQs6OtrBUeU_iduqzgWlacBWgwHpj2oVrxZ1tKhbnh-dodGobTzHHTk7EJpseD8mjNe4KuZ35BljocLaAMJxwqMpudEL8a1ar_QloQ8MD0oYdYFX4VVNFwiYWz88ZCtcDHt8",
    episode: 24
  },
  {
    id: 25,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwceGHY1n6TOgA5EnoA4VnHOGHuyzkvNJQFzCvbuJkAbTnlAm_fjsNfk_bav8Me69IrtcTBDEqHxWQgLNh74E07c0JQKQTl0s0sKpF2zoQ7TVOZIO0OzWitFt2TXexxj-V7HqgB",
    episode: 25
  },
  {
    id: 26,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxAc2MJeKeZrw2Nci6rWC_yJmw1hsc-4jq8prmfmBWsE1_tGZ00vP70Cva94VbyVDyMKMMrVzkNExEhVk8ZbkvHMT3_jP5_h1OC5JyiHR9X7tPVg3U6dfitmIhzgj-95LWWFg",
    episode: 26
  },
  {
    id: 27,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwIn0F1Cm1I_QFgOcsvFucxxlo-1jFWaHeQdzLUkSHonDcgGX0ttkJJ-1b15e9E7neCseuMehfrMSD1KbgpRIkbC2igQSfq7wkcAiHZIYafPyYBHU3z-t3t_05TJkjwZpRjIekQ",
    episode: 27
  },
  {
    id: 28,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzpmmPlxdKWzHp6c0bp9ziPgciMN58sDl-hu9wcRUv162JYBR46riRVp_xbzbFGW-SZFK3DwnPF5zfltHqlOWxSkh_b0gKjccIAtL3zJCBAzhZbJLos880UiQH-Cww8IEoCZdTP",
    episode: 28
  },
  {
    id: 29,
    src: "https://draft.blogger.com/video.g?token=AD6v5dz1gVk_iBpMGZP5y9U7F4ZeYfyjEvA8xVrM4bvk5TNhJdABRBZVCj1u3XijUn8CwDBEOg6h3MrHRZZvU2F4x6uIrwSCiS8BDLD5xRS0WlY8yumRhOyP-bVUWF9Q9MMd2PPD1Q",
    episode: 29
  },
  {
    id: 30,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw7whp6T6IkqZHZT7_VQXNK21IIqqf5R1ztCNdHjdrhNQtbsxN12BkGqWxD_HTUv-ZH_BLe7RrKRNgs-e07V3N7yAB0I6OOI-Y81haxxDCWQH9jmTzQ2sctbYXog9AvRFgtnuI",
    episode: 30
  },
  {
    id: 31,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw7whp6T6IkqZHZT7_VQXNK21IIqqf5R1ztCNdHjdrhNQtbsxN12BkGqWxD_HTUv-ZH_BLe7RrKRNgs-e07V3N7yAB0I6OOI-Y81haxxDCWQH9jmTzQ2sctbYXog9AvRFgtnuI",
    episode: 31
  },
  {
    id: 32,
    src: "https://draft.blogger.com/video.g?token=AD6v5dyhM1Lovwhit1yLLf8WSZ3ckYknXpzOIkbpFhXctC8-lhC8mVvHXeJVzarQMhhGpvaq2P5T531Wt24zXh35LhRjsd4Xpt7q5Dldp7myeHvp9AnmWLJ3OGMZXZjsoQY-1qUN9A",
    episode: 32
  },
  {
    id: 33,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxHv3vnFbBiCN80wgimCI00fZ49E-l4KBZwHj8T5yPrVIHqBlHS4n9BtpFPHNXxTP11J3LoHwdUzphKt9Hj-HQbGSDo-6CjuszQR0lSd2HAYYVa7MC8T19UVF_xDlICbh96-0Q",
    episode: 33
  },
  {
    id: 34,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzlcYQ236i-_kHNFXzazNYlsdO0uvRDD66QnIq1_M6ow8em-tWmIYbYCjSUN4kG6FQet6tghvhFEmBXGVP_4SVDogcWxrF33EbXdxk_VKzMHqUcLPMCnDr6kWrBawEX5fnR3JWs",
    episode: 34
  },
  {
    id: 35,
    src: "https://draft.blogger.com/video.g?token=AD6v5dx4Xiv-8dmbUnNsNQy-xydM_h0w9OQxUR9QQPZ5aFEH_BPJ7WlDgD8DFVvn2PMXNTBojLIxO1quQZR0vh03RUwBZ9ZG72SVhuJknG3XinJNC4Kykh_C_WtumaySN-f1S_F2YJA",
    episode: 35
  },
  {
    id: 36,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwC8r_szwi18aK9ItvrfW44tZDbiuvmuQ6hLRjqig3xkPwsh11iSdlToWw7QKBha94wOtUXC3GzqZAHDkDkgjSCCks7ZfFp1t3W9-XxucdyH674vMVZmcPhHBnYGJFFKWGjsvkC",
    episode: 36
  },
  {
    id: 37,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxRX_NAonkXITTJ4oZKEHiQanCdYn3BsReaQMwIIx-bD8-T0dgzUlQ1jPa6vx7ZHksZAbzcw_rwwD-P_tXHcYLlRXh7l85Z0ofw1nQDBWgDmunpNmGjeqP0-eDJY0ZpdRGb",
    episode: 37
  },
  {
    id: 38,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw5MaYXPFU0Hfcxx68FsKL7IeDW5rf-ooyiy-YaoPCnInYytLQM017xEhGG8iNtW3ku8Vv8nvHhSOl0laESy6NaxdSALSjr2AWZqYYUTAcOGVoVDjbemDkT5YjSHSA56Fd9Eg",
    episode: 38
  },
  {
    id: 39,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxs-WLy-sMBbAbQgjJj_M3Yb6KEYoNssIwmHf4MvJJLEx1hAyWg8Incw5EzoNuHPp5ibdvK1MAwCBLdBaOaBaX7KBg6ZE5JKidb0IB_3OgVtaDNbM9ZwmJ65IWrn2cOWtNC6_cP",
    episode: 39
  },
  {
    id: 40,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzAzxwQZNMuuXO5UMgdokuWs1RJVfX4NqM4DZ4ehY_fuwcaOU8RpLzNAjpPP5CXGKSHaiwh-tQqbVRDtACWQf2_aRfvNDKr8Tnl8KXMwjPk7mNlQJymxKPI0cdKheXgcRTnBPoM",
    episode: 40
  },
  {
    id: 41,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzeimD6F9n_o-5zGDkLCHETR96panGgFgLlCm9yPeuMstA4QucHkFUmiKiRqRNIUeb0IogvBuY7OeWOcH8xMxItltOEXp_8P9wFKluYdHmFGG74n6ys_LNV0qytapjxwEHXXJeV",
    episode: 41
  },
  {
    id: 42,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzaqMA6iPomiHTDxLVo0nsSi4Zfpc7ObQB0jmvTO3gqW8Tj90EkSif4ePJ4aPQ-nfOd0dm_eaA3HsKaSc33bDLt_TzpUJYF354jtxk1mdKxGFmxfRhDeXmfqf35C-dwbDTMwAM",
    episode: 42
  },
  {
    id: 43,
    src: "https://draft.blogger.com/video.g?token=AD6v5dwxA3hJFyFJnf1ttCeLG1JRmjvHAwFmCLYfNT6OUBfWdzzLuh9oSIbB42Ztp92pLOCNJyR7VzKUzZsFHM3cnA7R2G34Wt_iacKU49_ilZtWSQO6GS20zu4NFmrV_gW7OmfVLUkI",
    episode: 43
  },
  {
    id: 44,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxYvaHhySv2Xa3r-HGetooJN_dNWKtgHH4idteNUFEFTBHGqzvCGrynIsLJ7fpQVGTvesamKjwLJnHCtM9XEh2MsW3LY2yGDA2xOhO4R_WPYH2ATXq5Sjlz9POIGoD2L3GmVWs",
    episode: 44
  },
  {
    id: 45,
    src: "https://draft.blogger.com/video.g?token=AD6v5dx59PMmY_t9bVxl0BvheqAcL3GhDlBwy62oRm3Yp997gnUxjov1cpY2QioHIpP9-8Sb2yn18GR9NXRRRPsvteuJoVnfI_Lz2-tAvMQV9jTLgh-DwY5mWPzq-1oVA9l1aNRQc4I",
    episode: 45
  },
  {
    id: 46,
    src: "https://draft.blogger.com/video.g?token=AD6v5dxZW8UWuG0R9m-7uPRYl5c6xXT9NENR2z3ecvcdupDIQdlME40kamf2MLNe8Oo5aMQQ3vDdnDYf9-zF4vp2I_qe-X1nKpjjIzVTCRIneCwTRxWi3H--itN6XQXR06l7fIHcC3c",
    episode: 46
  },
  {
    id: 47,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw4-fLjqL328Kb-PfBumclCRzFzowqxXZxj5NBhdp5R-lWgg44BFJka5Zo-37oSjVfJpVUM5gElouHCADylBbWA5zLId_eAde_vZdtQi8y45w5rwpjw5Amu8-koE2a3hIe4gLk",
    episode: 47
  },
  {
    id: 48,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzGrRCOdMkHoUnfukhWP9hRG726zigZAmBOackesKjoJku9e0KuORjH1NVtNa5T_F3EwAqOtkS1LlVgficZGya1UOVeT-aXNvUDbR8o6thQwtLfa5pNQevuJd--PHSBA5BKjHM",
    episode: 48
  },
  {
    id: 49,
    src: "https://draft.blogger.com/video.g?token=AD6v5dzbXP974qQ3qp9A89gf716ynu3KXj20m91HSKoA-JEDyFYi5T-G_xXloLZgj4yt_t912M7N9TLhOqLiL1L9S6IKfD0lqPvFz5FzKbqr1fdIH9LZkwgxzQjTg6Qrsadu4yM6IHXd",
    episode: 49
  },
  {
    id: 50,
    src: "https://draft.blogger.com/video.g?token=AD6v5dw2doHIRLPxJcIRKv3aaapYgbOOuNgjlwh4aiU40UDmd14l8jaDVnq-JcAMP5TXD4UNM9BfSamPZTZP64RbEY5nuQEJun5P2uEbEz9leyefq7XxEVUvDzW0vwior0E0bg8UCTk",
    episode: 50
  },
];

export default onepiece;